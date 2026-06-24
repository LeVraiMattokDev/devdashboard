import { createConnection } from 'net';

function writeVarInt(value: number): number[] {
  const bytes: number[] = [];
  do {
    let b = value & 0x7F;
    value >>>= 7;
    if (value !== 0) b |= 0x80;
    bytes.push(b);
  } while (value !== 0);
  return bytes;
}

function writeString(s: string): number[] {
  const encoded = [...Buffer.from(s, 'utf8')];
  return [...writeVarInt(encoded.length), ...encoded];
}

function readVarInt(buf: Buffer, offset: number): [number, number] {
  let result = 0, shift = 0, i = offset;
  while (i < buf.length) {
    const b = buf[i++];
    result |= (b & 0x7F) << shift;
    shift += 7;
    if (!(b & 0x80)) return [result, i];
    if (shift >= 35) throw new Error('VarInt overflow');
  }
  throw new Error('Incomplete VarInt');
}

export type SlpResult = { online: number; max: number; version: string } | null;

export function slpPing(host: string, port = 25565, timeoutMs = 3000): Promise<SlpResult> {
  return new Promise(resolve => {
    let settled = false;
    const done = (v: SlpResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { socket.destroy(); } catch {}
      resolve(v);
    };
    const timer = setTimeout(() => done(null), timeoutMs);
    const socket = createConnection({ host, port });
    let buf = Buffer.alloc(0);

    socket.on('error', () => done(null));
    socket.on('connect', () => {
      // Handshake packet: [length][0x00][version][host][port][nextState]
      const body: number[] = [
        0x00,
        ...writeVarInt(47),
        ...writeString(host),
        (port >> 8) & 0xFF, port & 0xFF,
        0x01,
      ];
      const handshake = Buffer.from([...writeVarInt(body.length), ...body]);
      // Status request: [1][0x00]
      const statusReq = Buffer.from([0x01, 0x00]);
      socket.write(Buffer.concat([handshake, statusReq]));
    });

    socket.on('data', chunk => {
      buf = Buffer.concat([buf, chunk]);
      try {
        let pos = 0;
        const [pktLen, p1] = readVarInt(buf, pos);
        if (buf.length < p1 + pktLen) return;
        const [pktId, p2] = readVarInt(buf, p1);
        if (pktId !== 0x00) { done(null); return; }
        const [jsonLen, p3] = readVarInt(buf, p2);
        if (buf.length < p3 + jsonLen) return;
        const json = JSON.parse(buf.subarray(p3, p3 + jsonLen).toString('utf8')) as {
          version?: { name?: string };
          players?: { online?: number; max?: number };
        };
        done({ online: json.players?.online ?? 0, max: json.players?.max ?? 0, version: json.version?.name ?? '' });
      } catch { /* wait for more data */ }
    });
  });
}

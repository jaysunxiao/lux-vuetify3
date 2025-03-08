import IByteBuffer from '../IByteBuffer';
import IProtocolRegistration from '../IProtocolRegistration';
import Trending from './Trending';


class CrawlReutersAnswer {
    trending: Array<Trending> = [];
}

export class CrawlReutersAnswerRegistration implements IProtocolRegistration<CrawlReutersAnswer> {
    protocolId(): number {
        return 425;
    }

    write(buffer: IByteBuffer, packet: CrawlReutersAnswer | null) {
        if (packet === null) {
            buffer.writeInt(0);
            return;
        }
        buffer.writeInt(-1);
        buffer.writePacketList(packet.trending, 432);
    }

    read(buffer: IByteBuffer): CrawlReutersAnswer | null {
        const length = buffer.readInt();
        if (length === 0) {
            return null;
        }
        const beforeReadIndex = buffer.getReadOffset();
        const packet = new CrawlReutersAnswer();
        const list0 = buffer.readPacketList(432);
        packet.trending = list0;
        if (length > 0) {
            buffer.setReadOffset(beforeReadIndex + length);
        }
        return packet;
    }
}

export default CrawlReutersAnswer;
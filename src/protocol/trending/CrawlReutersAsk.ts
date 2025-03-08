import IByteBuffer from '../IByteBuffer';
import IProtocolRegistration from '../IProtocolRegistration';


class CrawlReutersAsk {
    
}

export class CrawlReutersAskRegistration implements IProtocolRegistration<CrawlReutersAsk> {
    protocolId(): number {
        return 424;
    }

    write(buffer: IByteBuffer, packet: CrawlReutersAsk | null) {
        if (packet === null) {
            buffer.writeInt(0);
            return;
        }
        buffer.writeInt(-1);
    }

    read(buffer: IByteBuffer): CrawlReutersAsk | null {
        const length = buffer.readInt();
        if (length === 0) {
            return null;
        }
        const beforeReadIndex = buffer.getReadOffset();
        const packet = new CrawlReutersAsk();
        
        if (length > 0) {
            buffer.setReadOffset(beforeReadIndex + length);
        }
        return packet;
    }
}

export default CrawlReutersAsk;
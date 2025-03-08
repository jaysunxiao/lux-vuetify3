import IByteBuffer from '../IByteBuffer';
import IProtocolRegistration from '../IProtocolRegistration';


class CrawlBloomBergAsk {
    
}

export class CrawlBloomBergAskRegistration implements IProtocolRegistration<CrawlBloomBergAsk> {
    protocolId(): number {
        return 422;
    }

    write(buffer: IByteBuffer, packet: CrawlBloomBergAsk | null) {
        if (packet === null) {
            buffer.writeInt(0);
            return;
        }
        buffer.writeInt(-1);
    }

    read(buffer: IByteBuffer): CrawlBloomBergAsk | null {
        const length = buffer.readInt();
        if (length === 0) {
            return null;
        }
        const beforeReadIndex = buffer.getReadOffset();
        const packet = new CrawlBloomBergAsk();
        
        if (length > 0) {
            buffer.setReadOffset(beforeReadIndex + length);
        }
        return packet;
    }
}

export default CrawlBloomBergAsk;
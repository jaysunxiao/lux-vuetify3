import IByteBuffer from '../IByteBuffer';
import IProtocolRegistration from '../IProtocolRegistration';
import Trending from './Trending';


class TrendingResponse {
    douyin: Array<Trending> = [];
    xueqiu: Array<Trending> = [];
    dfcf1: Array<Trending> = [];
    dfcf2: Array<Trending> = [];
    bloomBerg: Array<Trending> = [];
    reuters: Array<Trending> = [];
}

export class TrendingResponseRegistration implements IProtocolRegistration<TrendingResponse> {
    protocolId(): number {
        return 431;
    }

    write(buffer: IByteBuffer, packet: TrendingResponse | null) {
        if (packet === null) {
            buffer.writeInt(0);
            return;
        }
        buffer.writeInt(-1);
        buffer.writePacketList(packet.bloomBerg, 432);
        buffer.writePacketList(packet.dfcf1, 432);
        buffer.writePacketList(packet.dfcf2, 432);
        buffer.writePacketList(packet.douyin, 432);
        buffer.writePacketList(packet.reuters, 432);
        buffer.writePacketList(packet.xueqiu, 432);
    }

    read(buffer: IByteBuffer): TrendingResponse | null {
        const length = buffer.readInt();
        if (length === 0) {
            return null;
        }
        const beforeReadIndex = buffer.getReadOffset();
        const packet = new TrendingResponse();
        const list0 = buffer.readPacketList(432);
        packet.bloomBerg = list0;
        const list1 = buffer.readPacketList(432);
        packet.dfcf1 = list1;
        const list2 = buffer.readPacketList(432);
        packet.dfcf2 = list2;
        const list3 = buffer.readPacketList(432);
        packet.douyin = list3;
        const list4 = buffer.readPacketList(432);
        packet.reuters = list4;
        const list5 = buffer.readPacketList(432);
        packet.xueqiu = list5;
        if (length > 0) {
            buffer.setReadOffset(beforeReadIndex + length);
        }
        return packet;
    }
}

export default TrendingResponse;
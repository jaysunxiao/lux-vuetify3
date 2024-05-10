import IByteBuffer from '../IByteBuffer';


class SimulatorRegisterAsk {

    simulator: string = '';

    static PROTOCOL_ID: number = 1000;

    protocolId(): number {
        return SimulatorRegisterAsk.PROTOCOL_ID;
    }

    static write(buffer: IByteBuffer, packet: SimulatorRegisterAsk | null) {
        if (packet === null) {
            buffer.writeInt(0);
            return;
        }
        buffer.writeInt(-1);
        buffer.writeString(packet.simulator);
    }

    static read(buffer: IByteBuffer): SimulatorRegisterAsk | null {
        const length = buffer.readInt();
        if (length === 0) {
            return null;
        }
        const beforeReadIndex = buffer.getReadOffset();
        const packet = new SimulatorRegisterAsk();
        const result0 = buffer.readString();
        packet.simulator = result0;
        if (length > 0) {
            buffer.setReadOffset(beforeReadIndex + length);
        }
        return packet;
    }
}

export default SimulatorRegisterAsk;

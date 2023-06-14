

class ChatgptMessageNotice {

    requestId: number = 0;
    choice: string = '';
    finishReason: number = 0;

    static PROTOCOL_ID: number = 231;

    protocolId(): number {
        return ChatgptMessageNotice.PROTOCOL_ID;
    }

    static write(buffer: any, packet: ChatgptMessageNotice | null) {
        if (buffer.writePacketFlag(packet) || packet == null) {
            return;
        }
        buffer.writeString(packet.choice);
        buffer.writeInt(packet.finishReason);
        buffer.writeInt(packet.requestId);
    }

    static read(buffer: any): ChatgptMessageNotice | null {
        if (!buffer.readBoolean()) {
            return null;
        }
        const packet = new ChatgptMessageNotice();
        const result0 = buffer.readString();
        packet.choice = result0;
        const result1 = buffer.readInt();
        packet.finishReason = result1;
        const result2 = buffer.readInt();
        packet.requestId = result2;
        return packet;
    }
}

export default ChatgptMessageNotice;

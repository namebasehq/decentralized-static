/// <reference types="node" />
import { AbstractTokenizer } from './AbstractTokenizer';
import * as Stream from 'stream';
import { IFileInfo } from './types';
export declare class ReadStreamTokenizer extends AbstractTokenizer {
    private streamReader;
    constructor(stream: Stream.Readable, fileInfo?: IFileInfo);
    /**
     * Get file information, an HTTP-client may implement this doing a HEAD request
     * @return Promise with file information
     */
    getFileInfo(): Promise<IFileInfo>;
    /**
     * Read buffer from tokenizer
     * @param buffer - Target buffer to fill with data read from the tokenizer-stream
     * @param offset - Offset in the buffer to start writing at; if not provided, start at 0
     * @param length - The number of bytes to read
     * @param position - Offset where to begin reading within the file. If position is null, data will be read from the current file position.
     * @param maybeless - If set, will not throw an EOF error if not all of the requested data could be read
     * @returns Promise with number of bytes read
     */
    readBuffer(buffer: Buffer | Uint8Array, offset?: number, length?: number, position?: number, maybeless?: boolean): Promise<number>;
    /**
     * Peek (read ahead) buffer from tokenizer
     * @param buffer - Target buffer to write the data read to
     * @param offset - The offset in the buffer to start writing at; if not provided, start at 0
     * @param length - The number of bytes to read
     * @param position - Specifying where to begin reading from in the file. If position is null, data will be read from the current file position.
     * @param maybeless - If set, will not throw an EOF error if the less then the requested length could be read
     * @returns Promise with number of bytes peeked
     */
    peekBuffer(buffer: Buffer | Uint8Array, offset?: number, length?: number, position?: number, maybeless?: boolean): Promise<number>;
    ignore(length: number): Promise<number>;
}

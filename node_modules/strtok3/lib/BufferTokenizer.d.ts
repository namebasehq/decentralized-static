/// <reference types="node" />
import { IFileInfo, ITokenizer } from './types';
import { IGetToken, IToken } from '@tokenizer/token';
export declare class BufferTokenizer implements ITokenizer {
    private buffer;
    fileInfo: IFileInfo;
    position: number;
    /**
     * Construct BufferTokenizer
     * @param buffer - Buffer to tokenize
     * @param fileInfo - Pass additional file information to the tokenizer
     */
    constructor(buffer: Buffer, fileInfo?: IFileInfo);
    /**
     * Read buffer from tokenizer
     * @param buffer
     * @param offset is the offset in the buffer to start writing at; if not provided, start at 0
     * @param length is an integer specifying the number of bytes to read
     * @param position is an integer specifying where to begin reading from in the file. If position is null, data will be read from the current file position.
     * @returns {Promise<TResult|number>}
     */
    readBuffer(buffer: Buffer | Uint8Array, offset?: number, length?: number, position?: number): Promise<number>;
    /**
     * Peek (read ahead) buffer from tokenizer
     * @param buffer
     * @param offset is the offset in the buffer to start writing at; if not provided, start at 0
     * @param length is an integer specifying the number of bytes to read
     * @param position is an integer specifying where to begin reading from in the file. If position is null, data will be read from the current file position.
     * @param maybeLess If true, will return the bytes available if available bytes is less then length.
     * @returns {Promise<TResult|number>}
     */
    peekBuffer(buffer: Buffer | Uint8Array, offset?: number, length?: number, position?: number, maybeLess?: boolean): Promise<number>;
    readToken<T>(token: IGetToken<T>, position?: number): Promise<T>;
    peekToken<T>(token: IGetToken<T>, position?: number): Promise<T>;
    readNumber(token: IToken<number>): Promise<number>;
    peekNumber(token: IToken<number>): Promise<number>;
    /**
     * @return actual number of bytes ignored
     */
    ignore(length: number): Promise<number>;
    close(): Promise<void>;
}

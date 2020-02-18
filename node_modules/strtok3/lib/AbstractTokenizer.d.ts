/// <reference types="node" />
import { ITokenizer, IFileInfo } from './types';
import { IGetToken, IToken } from '@tokenizer/token';
/**
 * Core tokenizer
 */
export declare abstract class AbstractTokenizer implements ITokenizer {
    fileInfo: IFileInfo;
    protected constructor(fileInfo?: IFileInfo);
    /**
     * Tokenizer-stream position
     */
    position: number;
    private numBuffer;
    /**
     * Read buffer from tokenizer
     * @param buffer - Target buffer to fill with data read from the tokenizer-stream
     * @param offset - Offset in the buffer to start writing at; if not provided, start at 0
     * @param length - The number of bytes to read
     * @param position - Offset where to begin reading within the file. If position is null, data will be read from the current file position.
     * @param maybeless - If set, will not throw an EOF error if not all of the requested data could be read
     * @returns Promise with number of bytes read
     */
    abstract readBuffer(buffer: Buffer | Uint8Array, offset?: number, length?: number, position?: number, maybeless?: boolean): Promise<number>;
    /**
     * Peek (read ahead) buffer from tokenizer
     * @param buffer - Target buffer to fill with data peek from the tokenizer-stream
     * @param offset - The offset in the buffer to start writing at; if not provided, start at 0
     * @param length - The number of bytes to read
     * @param position - Offset where to begin reading within the file. If position is null, data will be read from the current file position.
     * @param maybeless - If set, will not throw an EOF error if not all of the requested data could be read
     * @returns Promise with number of bytes read
     */
    abstract peekBuffer(buffer: Buffer | Uint8Array, offset?: number, length?: number, position?: number, maybeless?: boolean): Promise<number>;
    /**
     * Read a token from the tokenizer-stream
     * @param token - The token to read
     * @param position - If provided, the desired position in the tokenizer-stream
     * @param maybeless - If set, will not throw an EOF error if not all of the requested data could be read
     * @returns Promise with token data
     */
    readToken<T>(token: IGetToken<T>, position?: number | null, maybeless?: boolean): Promise<T>;
    /**
     * Peek a token from the tokenizer-stream.
     * @param token - Token to peek from the tokenizer-stream.
     * @param position - Offset where to begin reading within the file. If position is null, data will be read from the current file position.
     * @param maybeless - If set, will not throw an EOF error if the less then the requested length could be read.
     * @returns Promise with token data
     */
    peekToken<T>(token: IGetToken<T>, position?: number, maybeless?: boolean): Promise<T>;
    /**
     * Read a numeric token from the stream
     * @param token - Numeric token
     * @returns Promise with number
     */
    readNumber(token: IToken<number>): Promise<number>;
    /**
     * Read a numeric token from the stream
     * @param token - Numeric token
     * @returns Promise with number
     */
    peekNumber(token: IToken<number>): Promise<number>;
    /**
     * Ignore number of bytes, advances the pointer in under tokenizer-stream.
     * @param length - Number of bytes to skip (ignore)
     * @return actual number of bytes ignored
     */
    abstract ignore(length: number): Promise<number>;
    close(): Promise<void>;
}

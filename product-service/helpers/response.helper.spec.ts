import {
    formattedErrorResponse,
    formattedSuccessResponse,
} from './response.helper';
import { ErrorsEnum } from '../types/errors.enum';
import { formatError } from './error.helper';

describe('helper: response', () => {
    describe('on formattedSuccessResponse', () => {
        describe('given data is null', () => {
            it('should return valid object', () => {
                expect(formattedSuccessResponse(null)).toEqual({
                    statusCode: 200,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: '{}',
                });
            });
        });

        describe('given data exists', () => {
            it('should return valid object', () => {
                const data = { a: 1, b: 2 };
                expect(formattedSuccessResponse(data)).toEqual({
                    statusCode: 200,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify(data),
                });
            });
        });
    });

    describe('on formattedErrorResponse', () => {
        describe('given data is null', () => {
            it('should return valid object', () => {
                expect(formattedErrorResponse(null)).toEqual({
                    statusCode: 500,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: '{}',
                });
            });
        });

        describe('given data exists', () => {
            it('should return valid object', () => {
                const error = {
                    type: ErrorsEnum.CorruptedData,
                    statusCode: 501,
                };
                expect(formattedErrorResponse(error)).toEqual({
                    statusCode: error.statusCode,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify(formatError(error.type)),
                });
            });
        });
    });
});

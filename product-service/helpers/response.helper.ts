import { IResponseGeneric } from '../types/response-generic.interface';
import { formatError } from './error.helper';
import { IError } from '../types/error.interface';

export const formattedSuccessResponse = <T>(
    data: T,
    statusCode: number = 200
): IResponseGeneric => {
    return {
        statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(data || {}),
    };
};

export const formattedErrorResponse = (error: IError): IResponseGeneric => {
    return {
        statusCode: (error && error.statusCode) || 500,
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(
            // TODO implement error codes
            formatError(error && error.type) || {}
        ),
    };
};

import { ErrorsEnum } from '../types/errors.enum';
import { IResponseError } from '../types/response-error.interface';

export const throwError = (type: ErrorsEnum, statusCode = 500): void => {
    throw {
        type,
        statusCode,
    };
};

export const formatError = (error: string, log?: string): IResponseError => {
    if (error == null) {
        return null;
    }

    if (!(<String[]>Object.values(ErrorsEnum)).includes(error)) {
        log = (error || '').toString();
    }

    return {
        meta: error,
        description: 'TODO error description 😝',
        log,
    };
};

import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import data from '../fake-data/MOCK_DATA.json';
import { ErrorsEnum } from '../types/errors.enum';
import {
    formattedErrorResponse,
    formattedSuccessResponse,
} from '../helpers/response.helper';
import { throwError } from '../helpers/error.helper';

export const getProductsList: APIGatewayProxyHandler = async () => {
    try {
        if (!data) {
            throwError(ErrorsEnum.CorruptedData);
        }

        return formattedSuccessResponse({
            count: data.length,
            items: data,
        });
    } catch (error) {
        return formattedErrorResponse(error);
    }
};

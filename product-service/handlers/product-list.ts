import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { formatError } from '../helpers/error.helper';
import data from '../fake-data/MOCK_DATA.json';
import { ErrorsEnum } from '../types/errors.enum';

export const getProductsList: APIGatewayProxyHandler = async () => {
    try {
        if (!data) {
            throw ErrorsEnum.CorruptedData;
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                count: data.length,
                items: data,
            }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify(
                // TODO implement error codes
                formatError(error)
            ),
        };
    }
};

import {
    APIGatewayEventDefaultAuthorizerContext,
    APIGatewayProxyEventBase,
    APIGatewayProxyHandler,
} from 'aws-lambda';
import 'source-map-support/register';
import { formatError } from '../helpers/error.helper';
import { ErrorsEnum } from '../types/errors.enum';
import * as data from '../fake-data/MOCK_DATA.json';

export const getProductsById: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>
) => {
    try {
        const id = event.pathParameters.productId;
        const item = data.find((item: any) => item.id === Number(id));

        if (!id) {
            throw ErrorsEnum.WrongRequest;
        }
        if (!data) {
            throw ErrorsEnum.CorruptedData;
        }
        if (!item) {
            throw ErrorsEnum.NotFoundData;
        }

        return {
            statusCode: 200,
            body: JSON.stringify(item),
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

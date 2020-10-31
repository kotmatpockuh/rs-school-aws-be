import {
    APIGatewayEventDefaultAuthorizerContext,
    APIGatewayProxyEventBase,
    APIGatewayProxyHandler,
} from 'aws-lambda';
import 'source-map-support/register';
import { formatError } from '../helpers/error.helper';
import { ErrorsEnum } from '../types/errors.enum';
import data from '../fake-data/MOCK_DATA.json';
import { IProductItem } from '../types/product-item.interface';

export const getProductsById: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>
) => {
    try {
        const id =
            event &&
            event.pathParameters &&
            Number(event.pathParameters.productId);

        if (id == null) {
            throw ErrorsEnum.WrongRequest;
        }

        if (!data) {
            throw ErrorsEnum.CorruptedData;
        }

        const item = data.find((item: IProductItem) => item.id === id);

        if (!item) {
            throw ErrorsEnum.NotFoundData;
        }

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify(item),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify(
                // TODO implement error codes
                formatError(error)
            ),
        };
    }
};

import {
    APIGatewayEventDefaultAuthorizerContext,
    APIGatewayProxyEventBase,
    APIGatewayProxyHandler,
} from 'aws-lambda';
import 'source-map-support/register';
import { throwError } from '../helpers/error.helper';
import { ErrorsEnum } from '../types/errors.enum';
import data from '../fake-data/MOCK_DATA.json';
import { IProductItem } from '../types/product-item.interface';
import {
    formattedErrorResponse,
    formattedSuccessResponse,
} from '../helpers/response.helper';

export const getProductsById: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>
) => {
    try {
        const id =
            event &&
            event.pathParameters &&
            Number(event.pathParameters.productId);

        if (id == null) {
            throwError(ErrorsEnum.WrongRequest, 400);
        }

        if (!data) {
            throwError(ErrorsEnum.CorruptedData);
        }

        const item = data.find((item: IProductItem) => item.id === id);

        if (!item) {
            throwError(ErrorsEnum.NotFoundData, 404);
        }

        return formattedSuccessResponse(item);
    } catch (error) {
        return formattedErrorResponse(error);
    }
};

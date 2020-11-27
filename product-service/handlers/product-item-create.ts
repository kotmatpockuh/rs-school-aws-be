import {
    APIGatewayEventDefaultAuthorizerContext,
    APIGatewayProxyEventBase,
    APIGatewayProxyHandler,
} from 'aws-lambda';
import 'source-map-support/register';
import {
    formattedErrorResponse,
    formattedSuccessResponse,
} from '../../shared/helpers/response.helper';
import { IProductItem } from '../types/product-item.interface';
import { ProductService } from '../services/product.service';

export const createProducts: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>
) => {
    console.log('📝 createProducts: ', event);

    try {
        const productService = new ProductService();

        const product = <IProductItem>JSON.parse(event?.body || null);

        const createdProduct = await productService.createProduct(product);

        return formattedSuccessResponse(createdProduct);
    } catch (error) {
        return formattedErrorResponse(error);
    }
};

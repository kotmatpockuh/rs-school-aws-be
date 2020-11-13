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
import AWS from 'aws-sdk';
import { BUCKET } from '../constants';
import { throwError } from '../../shared/helpers/error.helper';
import { ErrorsEnum } from '../../shared/types/errors.enum';

export const importProductsFile: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>
) => {
    console.log('📝 importProductsFile: ', event);

    try {
        const fileName = event?.queryStringParameters?.name;

        if (!fileName) {
            throwError(ErrorsEnum.WrongRequest, 400);
        }

        const s3 = new AWS.S3({ region: 'eu-west-1' });

        const url = s3.getSignedUrl('getObject', {
            Bucket: BUCKET,
            Key: `uploaded/${fileName}`,
            Expires: 60,
        });

        return formattedSuccessResponse(url);
    } catch (error) {
        return formattedErrorResponse(error);
    }
};

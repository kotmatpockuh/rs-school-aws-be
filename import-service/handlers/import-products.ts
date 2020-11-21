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
import { ALLOWED_FILE_CONTENT_TYPE, BUCKET } from '../constants';
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

        const s3 = new AWS.S3({ region: 'eu-west-1', signatureVersion: 'v4' });

        const url = await s3
            .getSignedUrlPromise('putObject', {
                Bucket: BUCKET,
                Key: `uploaded/${fileName}`,
                Expires: 60,
                ContentType: ALLOWED_FILE_CONTENT_TYPE,
            })
            .catch((s3Err) =>
                throwError(ErrorsEnum.CorruptedData, 500, JSON.stringify(s3Err))
            );

        return formattedSuccessResponse(url);
    } catch (error) {
        return formattedErrorResponse(error);
    }
};

import { APIGatewayTokenAuthorizerEvent } from 'aws-lambda';
import 'source-map-support/register';
import { ErrorsEnum } from '../../shared/types/errors.enum';
import { throwError } from '../../shared/helpers/error.helper';

export const basicAuthorizer: (
    event: APIGatewayTokenAuthorizerEvent
) => Promise<any> = async (event: APIGatewayTokenAuthorizerEvent) => {
    console.log('📝 basicAuthorizer: ', event);

    try {
        if (event?.type !== 'TOKEN') {
            throwError(ErrorsEnum.CorruptedAuthorization, 401);
        }

        const authData = (event?.authorizationToken || '').split('Basic ')[1];

        if (!authData) {
            throwError(ErrorsEnum.CorruptedAuthorization, 401);
        }

        const decodedUserPwd =
            Buffer.from(authData, 'base64').toString('utf-8') || '';
        console.log('🔓 unlocked: ', authData, decodedUserPwd);

        // TODO remove it later
        const username = decodedUserPwd.split(':')[0];
        const pwd = decodedUserPwd.split(':')[1];
        const storedUserPwd = process.env[username];
        const effect =
            !storedUserPwd || storedUserPwd !== pwd ? 'Deny' : 'Allow';

        const policy = generatePolicy(authData, event?.methodArn, effect);

        return policy;
    } catch (error) {
        return error;
    }
};

const generatePolicy = (principalId, resource, effect = 'Allow') => {
    return {
        principalId: principalId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: effect,
                    Resource: resource,
                },
            ],
        },
    };
};

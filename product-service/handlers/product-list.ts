import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { formatError } from '../helpers/error.helper';
import data from '../fake-data/MOCK_DATA.json';
import { ErrorsEnum } from '../types/errors.enum';
// import * as nodeFetch from 'node-fetch';

export const getProductsList: APIGatewayProxyHandler = async () => {
    try {
        if (!data) {
            throw ErrorsEnum.CorruptedData;
        }

        // just a dummy async-await example
        /*const fakeCryptoData = await nodeFetch(
            'https://api.coindesk.com/v1/bpi/currentprice.json'
        );
        const fakeCryptoDataJSON = await fakeCryptoData.json();*/

        return {
            statusCode: 200,
            body: JSON.stringify({
                count: data.length,
                items: data,
                // exampleCrypto: fakeCryptoDataJSON,
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

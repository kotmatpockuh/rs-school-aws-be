import { SQSEvent } from 'aws-lambda';
import AWS from 'aws-sdk';
import { DEFAULT_AWS_REGION } from '../../shared/constants';

export const catalogBatchProcess: (event: SQSEvent) => Promise<void> = async (
    event: SQSEvent
) => {
    console.log('📝 catalogBatchProcess: ', event);

    try {
        const sns = new AWS.SNS(DEFAULT_AWS_REGION);

        await sns
            .publish({
                Subject: '🤔 Data is being processed',
                Message: JSON.stringify(
                    (event.Records || []).map((item) => item.body)
                ),
                TopicArn: process.env.SNS_ARN,
            })
            .promise();
    } catch (error) {
        console.log('📚 catalogBatchProcess Error: ', error);
    }
};

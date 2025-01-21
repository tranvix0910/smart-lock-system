import {
	CognitoUserPool
} from 'amazon-cognito-identity-js';

var poolData = {
	UserPoolId: 'ap-southeast-1_Whb2j6V1J', 
	ClientId: '25s1gckni9viipabm9ajvjt1sp',
    ClientSecret: 'hj5f73po7bh7q1r4qj9n94tvjpeakiml5qu9gh6c8kc4t6euah0'
};
const userPool = new CognitoUserPool(poolData);

export { poolData }
export default userPool;
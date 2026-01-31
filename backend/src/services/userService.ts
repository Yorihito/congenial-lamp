import { TableClient, TableServiceClient } from '@azure/data-tables';
import { User, UserPreferences, DEFAULT_USER_PREFERENCES } from '../models/User';
import { randomUUID } from 'crypto';

const connectionString = process.env.TABLE_STORAGE_CONNECTION_STRING || 'UseDevelopmentStorage=true';

let usersTableClient: TableClient | null = null;

export function getUsersTableClient(): TableClient {
    if (!usersTableClient) {
        usersTableClient = TableClient.fromConnectionString(connectionString, 'Users');
    }
    return usersTableClient;
}

export async function createUser(azureAdOid: string, facebookUserId?: string, locale: string = 'ja-JP'): Promise<User> {
    const tableClient = getUsersTableClient();
    const userId = randomUUID();
    const now = new Date();

    const user: User = {
        partitionKey: 'user',
        rowKey: userId,
        azureAdOid,
        facebookUserId,
        locale,
        createdAt: now,
        lastLoginAt: now,
        preferences: JSON.stringify(DEFAULT_USER_PREFERENCES),
    };

    await tableClient.createEntity(user);
    return user;
}

export async function getUserByAzureAdOid(azureAdOid: string): Promise<User | null> {
    const tableClient = getUsersTableClient();

    // Query users by azureAdOid
    const users = tableClient.listEntities<User>({
        queryOptions: {
            filter: `PartitionKey eq 'user' and azureAdOid eq '${azureAdOid}'`,
        },
    });

    for await (const user of users) {
        return user;
    }
    return null;
}

export async function getUserById(userId: string): Promise<User | null> {
    const tableClient = getUsersTableClient();

    try {
        const user = await tableClient.getEntity<User>('user', userId);
        return user;
    } catch (error: any) {
        if (error.statusCode === 404) {
            return null;
        }
        throw error;
    }
}

export async function updateUserLastLogin(userId: string): Promise<void> {
    const tableClient = getUsersTableClient();
    await tableClient.updateEntity({
        partitionKey: 'user',
        rowKey: userId,
        lastLoginAt: new Date(),
    }, 'Merge');
}

export async function updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const tableClient = getUsersTableClient();
    const user = await getUserById(userId);

    if (!user) {
        throw new Error('User not found');
    }

    const currentPreferences: UserPreferences = JSON.parse(user.preferences);
    const updatedPreferences: UserPreferences = {
        ...currentPreferences,
        ...preferences,
    };

    await tableClient.updateEntity({
        partitionKey: 'user',
        rowKey: userId,
        preferences: JSON.stringify(updatedPreferences),
    }, 'Merge');

    return updatedPreferences;
}

export async function updateUserFacebookConnection(
    userId: string,
    facebookUserId: string,
    accessToken: string,
    tokenExpiry: Date
): Promise<void> {
    const tableClient = getUsersTableClient();
    await tableClient.updateEntity({
        partitionKey: 'user',
        rowKey: userId,
        facebookUserId,
        facebookAccessToken: accessToken,
        facebookTokenExpiry: tokenExpiry,
    }, 'Merge');
}

export async function disconnectUserFacebook(userId: string): Promise<void> {
    const tableClient = getUsersTableClient();
    await tableClient.updateEntity({
        partitionKey: 'user',
        rowKey: userId,
        facebookUserId: '',
        facebookAccessToken: '',
        facebookTokenExpiry: null,
    }, 'Merge');
}

export async function deleteUser(userId: string): Promise<void> {
    const tableClient = getUsersTableClient();
    await tableClient.deleteEntity('user', userId);
}

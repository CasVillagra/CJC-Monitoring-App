import React, { useState, useEffect } from 'react';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';
import { CognitoIdentityProviderClient, ListUsersCommand } from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient, ScanCommand, PutItemCommand, QueryCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb"; 
import { 
  Container, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Select, 
  MenuItem, 
  Alert, 
  CircularProgress,
  Box,
  FormControl,
  InputLabel,
  Chip,
  OutlinedInput,
  ListItemText,
  Checkbox
} from '@mui/material';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const AdminOnboarding = () => {
  const [authState, setAuthState] = useState({
    isAdmin: false,
    isLoading: true,
    error: null,
    userGroups: []
  });
  const [formData, setFormData] = useState({
    selectedUser: '',
    selectedPlants: []
  });
  const [users, setUsers] = useState([]);
  const [plants, setPlants] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [currentUserPlants, setCurrentUserPlants] = useState([]);

  useEffect(() => {
    checkUserAuthorization();
    fetchUsers();
    fetchPlants();
  }, []);

  useEffect(() => {
    if (formData.selectedUser) {
      fetchUserPlants(formData.selectedUser);
    } else {
      setCurrentUserPlants([]);
    }
  }, [formData.selectedUser]);

  const checkUserAuthorization = async () => {
    try {
      const session = await fetchAuthSession();
      const user = await getCurrentUser();
      const groups = session.tokens?.accessToken?.payload['cognito:groups'] || [];
      
      setAuthState({
        isAdmin: groups.includes('Admins'),
        isLoading: false,
        error: null,
        userGroups: groups
      });
    } catch (error) {
      console.error('Authorization check failed:', error);
      setAuthState({
        isAdmin: false,
        isLoading: false,
        error: 'Failed to verify authorization. Please try signing in again.',
        userGroups: []
      });
    }
  };

  const fetchUsers = async () => {
    try {
      const session = await fetchAuthSession();
      const credentials = await session.credentials;
      
      const cognitoClient = new CognitoIdentityProviderClient({
        region: process.env.REACT_APP_AWS_REGION,
        credentials: {
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey,
          sessionToken: credentials.sessionToken
        }
      });

      const command = new ListUsersCommand({
        UserPoolId: process.env.REACT_APP_USER_POOL_ID,
        Limit: 60
      });

      const response = await cognitoClient.send(command);
      
      const usersList = response.Users.map(user => ({
        username: user.Username,
        email: user.Attributes.find(attr => attr.Name === 'email')?.Value
      }));
      
      setUsers(usersList);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setAuthState(prev => ({
        ...prev,
        error: 'Failed to load users list'
      }));
    }
  };

  const fetchPlants = async () => {
    setIsLoadingData(true);
    try {
      const session = await fetchAuthSession();
      const credentials = await session.credentials;

      const dynamoClient = new DynamoDBClient({
        region: process.env.REACT_APP_AWS_REGION,
        credentials: {
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey,
          sessionToken: credentials.sessionToken
        }
      });

      const command = new ScanCommand({
        TableName: 'PlantsDataTable',
        ProjectionExpression: 'plantId',
        FilterExpression: 'dataCategory = :category',
        ExpressionAttributeValues: {
          ':category': { S: 'plant' }
        }
      });

      const response = await dynamoClient.send(command);
      
      const plantsList = response.Items.map(item => ({
        id: item.plantId.S,
        name: item.plantId.S
      }));

      setPlants(plantsList);
    } catch (error) {
      console.error('Failed to fetch plants:', error);
      setAuthState(prev => ({
        ...prev,
        error: 'Failed to load plants list'
      }));
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchUserPlants = async (username) => {
    try {
      const session = await fetchAuthSession();
      const credentials = await session.credentials;

      const dynamoClient = new DynamoDBClient({
        region: process.env.REACT_APP_AWS_REGION,
        credentials: {
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey,
          sessionToken: credentials.sessionToken
        }
      });

      const command = new QueryCommand({
        TableName: 'UserPlantAccess',
        KeyConditionExpression: 'username = :username',
        ExpressionAttributeValues: {
          ':username': { S: username }
        }
      });

      const response = await dynamoClient.send(command);
      const userPlants = response.Items.map(item => item.plantId.S);
      
      setCurrentUserPlants(userPlants);
      setFormData(prev => ({
        ...prev,
        selectedPlants: userPlants
      }));
    } catch (error) {
      console.error('Failed to fetch user plants:', error);
    }
  };

  const handleAssignPlants = async () => {
    if (!formData.selectedUser || formData.selectedPlants.length === 0) {
      setAuthState(prev => ({
        ...prev,
        error: 'Please select a user and at least one plant'
      }));
      return;
    }

    try {
      const session = await fetchAuthSession();
      const credentials = await session.credentials;

      const dynamoClient = new DynamoDBClient({
        region: process.env.REACT_APP_AWS_REGION,
        credentials: {
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey,
          sessionToken: credentials.sessionToken
        }
      });

      // Delete existing assignments
      for (const plantId of currentUserPlants) {
        if (!formData.selectedPlants.includes(plantId)) {
          const deleteCommand = new DeleteItemCommand({
            TableName: 'UserPlantAccess',
            Key: {
              username: { S: formData.selectedUser },
              plantId: { S: plantId }
            }
          });
          await dynamoClient.send(deleteCommand);
        }
      }

      // Add new assignments
      for (const plantId of formData.selectedPlants) {
        if (!currentUserPlants.includes(plantId)) {
          const putCommand = new PutItemCommand({
            TableName: 'UserPlantAccess',
            Item: {
              username: { S: formData.selectedUser },
              plantId: { S: plantId },
              createdAt: { S: new Date().toISOString() }
            }
          });
          await dynamoClient.send(putCommand);
        }
      }

      setAuthState(prev => ({
        ...prev,
        error: null
      }));
      
      // Update current user plants
      setCurrentUserPlants(formData.selectedPlants);

    } catch (error) {
      console.error('Plant assignment failed:', error);
      setAuthState(prev => ({
        ...prev,
        error: 'Failed to assign plants. Please try again.'
      }));
    }
  };

  if (authState.isLoading || isLoadingData) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!authState.isAdmin) {
    return (
      <Container maxWidth="sm">
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h5" color="error" gutterBottom>
              Access Denied
            </Typography>
            <Typography variant="body1">
              You do not have administrative access to this page.
              {authState.userGroups.length > 0 && (
                <Box mt={2}>
                  Your groups: {authState.userGroups.join(', ')}
                </Box>
              )}
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Admin Onboarding
          </Typography>
          
          {authState.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {authState.error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Select User</InputLabel>
              <Select
                value={formData.selectedUser}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  selectedUser: e.target.value,
                  selectedPlants: []
                }))}
                label="Select User"
              >
                <MenuItem value="" disabled>
                  Select User
                </MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.username} value={user.username}>
                    {user.email || user.username}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Select Plants</InputLabel>
              <Select
                multiple
                value={formData.selectedPlants}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  selectedPlants: e.target.value
                }))}
                input={<OutlinedInput label="Select Plants" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {plants.map((plant) => (
                  <MenuItem key={plant.id} value={plant.id}>
                    <Checkbox checked={formData.selectedPlants.indexOf(plant.id) > -1} />
                    <ListItemText primary={plant.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button 
              variant="contained" 
              color="primary"
              onClick={handleAssignPlants}
              fullWidth
              disabled={!formData.selectedUser}
            >
              Update Plant Access
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AdminOnboarding;
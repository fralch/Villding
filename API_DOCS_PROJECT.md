# API Documentation - Project Management

## Base URL
```
http://your-domain.com/endpoint/project
```

## Authentication
This API uses session-based authentication. Ensure the user is logged in before making requests.

---

## Endpoints

### 1. Get All Projects
**GET** `/endpoint/project/all`

Returns a list of all projects.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Proyecto Ejemplo",
    "location": "Bogotá",
    "company": "Empresa ABC",
    "code": "abc1234567",
    "start_date": "2025-01-01",
    "end_date": "2025-12-31",
    "nearest_monday": "2024-12-30",
    "uri": "https://villding.s3.us-east-2.amazonaws.com/projects/uuid.jpg",
    "project_type_id": 1,
    "project_subtype_id": 2,
    "created_at": "2025-01-01T00:00:00.000000Z",
    "updated_at": "2025-01-01T00:00:00.000000Z"
  }
]
```

---

### 2. Create Project
**POST** `/endpoint/project/store`

Creates a new project with optional image upload to S3.

**Content-Type:** `multipart/form-data`

**Request Body:**
```javascript
{
  name: string,              // Required - Project name
  location: string,          // Required - Project location
  company: string,           // Required - Company name
  start_date: string,        // Required - Format: YYYY-MM-DD
  end_date: string,          // Required - Format: YYYY-MM-DD
  nearest_monday: string,    // Required - Format: YYYY-MM-DD
  project_type_id: number,   // Required - ID of project type
  project_subtype_id: number,// Optional - ID of project subtype
  uri: File                  // Optional - Image file (jpg, png, etc.)
}
```

**Example (React Native with FormData):**
```javascript
const createProject = async (projectData, imageUri) => {
  const formData = new FormData();

  // Add text fields
  formData.append('name', projectData.name);
  formData.append('location', projectData.location);
  formData.append('company', projectData.company);
  formData.append('start_date', projectData.start_date);
  formData.append('end_date', projectData.end_date);
  formData.append('nearest_monday', projectData.nearest_monday);
  formData.append('project_type_id', projectData.project_type_id);

  if (projectData.project_subtype_id) {
    formData.append('project_subtype_id', projectData.project_subtype_id);
  }

  // Add image if selected
  if (imageUri) {
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('uri', {
      uri: imageUri,
      name: filename,
      type: type
    });
  }

  try {
    const response = await fetch('http://your-domain.com/endpoint/project/store', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};
```

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "Proyecto Ejemplo",
  "location": "Bogotá",
  "company": "Empresa ABC",
  "code": "abc1234567",
  "start_date": "2025-01-01",
  "end_date": "2025-12-31",
  "nearest_monday": "2024-12-30",
  "uri": "https://villding.s3.us-east-2.amazonaws.com/projects/uuid.jpg",
  "project_type_id": 1,
  "project_subtype_id": null,
  "created_at": "2025-01-01T00:00:00.000000Z",
  "updated_at": "2025-01-01T00:00:00.000000Z"
}
```

**Notes:**
- If no image is provided, a default image URL will be used
- Images are uploaded to Amazon S3 in the `projects/` folder
- The `code` field is auto-generated (10 random characters)
- The `uri` field returns the full S3 URL for the image

---

### 3. Get Project by ID
**GET** `/endpoint/project/show/{id}`

Returns details of a specific project.

**URL Parameters:**
- `id` (number) - Project ID

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Proyecto Ejemplo",
  "location": "Bogotá",
  "company": "Empresa ABC",
  "code": "abc1234567",
  "start_date": "2025-01-01",
  "end_date": "2025-12-31",
  "nearest_monday": "2024-12-30",
  "uri": "https://villding.s3.us-east-2.amazonaws.com/projects/uuid.jpg",
  "project_type_id": 1,
  "project_subtype_id": 2,
  "created_at": "2025-01-01T00:00:00.000000Z",
  "updated_at": "2025-01-01T00:00:00.000000Z"
}
```

**Response (404 Not Found):**
```json
{
  "message": "No query results for model [App\\Models\\Project] {id}"
}
```

---

### 4. Update Project
**POST** `/endpoint/project/update/{id}`

Updates an existing project. Can update image (old image will be deleted from S3).

**Content-Type:** `multipart/form-data`

**URL Parameters:**
- `id` (number) - Project ID

**Request Body (all fields optional):**
```javascript
{
  name: string,              // Optional - Project name
  location: string,          // Optional - Project location
  company: string,           // Optional - Company name
  start_date: string,        // Optional - Format: YYYY-MM-DD
  end_date: string,          // Optional - Format: YYYY-MM-DD (must be after start_date)
  nearest_monday: string,    // Optional - Format: YYYY-MM-DD
  project_type_id: number,   // Optional - ID of project type
  project_subtype_id: number,// Optional - ID of project subtype (nullable)
  uri: File                  // Optional - New image file (old one will be deleted)
}
```

**Example (React Native):**
```javascript
const updateProject = async (projectId, updates, newImageUri) => {
  const formData = new FormData();

  // Add only the fields that changed
  if (updates.name) formData.append('name', updates.name);
  if (updates.location) formData.append('location', updates.location);
  if (updates.company) formData.append('company', updates.company);
  // ... add other fields as needed

  // Add new image if selected
  if (newImageUri) {
    const filename = newImageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('uri', {
      uri: newImageUri,
      name: filename,
      type: type
    });
  }

  try {
    const response = await fetch(`http://your-domain.com/endpoint/project/update/${projectId}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};
```

**Response (200 OK):**
```json
{
  "message": "Proyecto actualizado correctamente",
  "project": {
    "id": 1,
    "name": "Proyecto Actualizado",
    "location": "Medellín",
    "company": "Empresa XYZ",
    "code": "abc1234567",
    "start_date": "2025-01-01",
    "end_date": "2025-12-31",
    "nearest_monday": "2024-12-30",
    "uri": "https://villding.s3.us-east-2.amazonaws.com/projects/new-uuid.jpg",
    "project_type_id": 1,
    "project_subtype_id": 2,
    "updated_at": "2025-01-15T10:30:00.000000Z"
  }
}
```

**Response (404 Not Found):**
```json
{
  "message": "Proyecto no encontrado"
}
```

**Response (422 Validation Error):**
```json
{
  "message": "Error de validación",
  "errors": {
    "end_date": ["The end date must be a date after or equal to start date."]
  }
}
```

**Response (422 Duplicate Name):**
```json
{
  "message": "Ya existe un proyecto con este nombre",
  "error": "El nombre del proyecto debe ser único"
}
```

**Notes:**
- When a new image is uploaded, the old image is automatically deleted from S3
- Maximum image size: 2MB
- Only send the fields you want to update

---

### 5. Delete Project
**DELETE** `/endpoint/project/destroy/{id}`

Deletes a project and its associated image from S3.

**URL Parameters:**
- `id` (number) - Project ID

**Example (React Native):**
```javascript
const deleteProject = async (projectId) => {
  try {
    const response = await fetch(`http://your-domain.com/endpoint/project/destroy/${projectId}`, {
      method: 'DELETE',
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};
```

**Response (200 OK):**
```json
{
  "message": "Proyecto eliminado correctamente"
}
```

**Response (404 Not Found):**
```json
{
  "message": "No query results for model [App\\Models\\Project] {id}"
}
```

**Notes:**
- This will permanently delete the project from the database
- The associated image will be deleted from S3
- This action cannot be undone

---

### 6. Get Project Types
**GET** `/endpoint/project/types`

Returns all available project types.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Construcción",
    "description": "Proyectos de construcción",
    "created_at": "2025-01-01T00:00:00.000000Z",
    "updated_at": "2025-01-01T00:00:00.000000Z"
  },
  {
    "id": 2,
    "name": "Remodelación",
    "description": "Proyectos de remodelación",
    "created_at": "2025-01-01T00:00:00.000000Z",
    "updated_at": "2025-01-01T00:00:00.000000Z"
  }
]
```

---

### 7. Get Project Subtypes
**GET** `/endpoint/project/subtypes`

Returns all available project subtypes.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Edificios",
    "description": "Construcción de edificios",
    "project_type_id": 1,
    "created_at": "2025-01-01T00:00:00.000000Z",
    "updated_at": "2025-01-01T00:00:00.000000Z"
  },
  {
    "id": 2,
    "name": "Casas",
    "description": "Construcción de casas",
    "project_type_id": 1,
    "created_at": "2025-01-01T00:00:00.000000Z",
    "updated_at": "2025-01-01T00:00:00.000000Z"
  }
]
```

---

### 8. Get Project Types by Project ID
**GET** `/endpoint/project/types/{project_id}`

Returns the type and subtype of a specific project.

**URL Parameters:**
- `project_id` (number) - Project ID

**Response (200 OK):**
```json
{
  "project_id": 1,
  "project_name": "Proyecto Ejemplo",
  "type": {
    "id": 1,
    "name": "Construcción",
    "description": "Proyectos de construcción"
  },
  "subtype": {
    "id": 2,
    "name": "Edificios",
    "description": "Construcción de edificios",
    "project_type_id": 1
  }
}
```

**Response (404 Not Found):**
```json
{
  "message": "Proyecto no encontrado"
}
```

---

### 9. Get Project Subtypes by Project ID
**GET** `/endpoint/project/subtypes/{project_id}`

Returns all subtypes available for a project's type.

**URL Parameters:**
- `project_id` (number) - Project ID

**Response (200 OK):**
```json
{
  "project_id": 1,
  "project_name": "Proyecto Ejemplo",
  "project_type_id": 1,
  "project_type_name": "Construcción",
  "subtypes": [
    {
      "id": 1,
      "name": "Edificios",
      "description": "Construcción de edificios",
      "project_type_id": 1
    },
    {
      "id": 2,
      "name": "Casas",
      "description": "Construcción de casas",
      "project_type_id": 1
    }
  ]
}
```

---

### 10. Create Project Type
**POST** `/endpoint/project/type/store`

Creates a new project type.

**Request Body:**
```json
{
  "name": "Infraestructura",
  "description": "Proyectos de infraestructura"
}
```

**Response (201 Created):**
```json
{
  "id": 3,
  "name": "Infraestructura",
  "description": "Proyectos de infraestructura",
  "created_at": "2025-01-01T00:00:00.000000Z",
  "updated_at": "2025-01-01T00:00:00.000000Z"
}
```

---

### 11. Create Project Subtype
**POST** `/endpoint/project/subtype/store`

Creates a new project subtype.

**Request Body:**
```json
{
  "name": "Puentes",
  "description": "Construcción de puentes",
  "project_type_id": 1
}
```

**Response (201 Created):**
```json
{
  "id": 5,
  "name": "Puentes",
  "description": "Construcción de puentes",
  "project_type_id": 1,
  "created_at": "2025-01-01T00:00:00.000000Z",
  "updated_at": "2025-01-01T00:00:00.000000Z"
}
```

---

### 12. Attach User to Project
**POST** `/endpoint/project/attach`

Associates a user with a project, optionally as an admin.

**Request Body:**
```json
{
  "user_id": 5,
  "project_id": 10,
  "is_admin": true  // Optional, defaults to false
}
```

**Response (200 OK):**
```json
{
  "message": "Project successfully linked to user",
  "user": {
    "id": 5,
    "name": "Juan",
    "email": "juan@example.com",
    "projects": [
      {
        "id": 10,
        "name": "Proyecto Ejemplo",
        "pivot": {
          "user_id": 5,
          "project_id": 10,
          "is_admin": true
        }
      }
    ]
  }
}
```

**Response (422 Validation Error):**
```json
{
  "message": "Validation failed",
  "errors": {
    "user_id": ["The user id field is required."]
  }
}
```

---

### 13. Detach User from Project
**POST** `/endpoint/project/detach`

Removes the association between a user and a project.

**Request Body:**
```json
{
  "user_id": 5,
  "project_id": 10
}
```

**Response (200 OK):**
```json
{
  "message": "Project successfully unlinked from user",
  "user": {
    "id": 5,
    "name": "Juan",
    "email": "juan@example.com",
    "projects": []
  }
}
```

---

### 14. Check Project-User Attachment
**POST** `/endpoint/project/check-attachment`

Returns all users associated with a project.

**Request Body:**
```json
{
  "project_id": 10
}
```

**Response (200 OK):**
```json
{
  "project": {
    "id": 10,
    "name": "Proyecto Ejemplo",
    "location": "Bogotá",
    "company": "Empresa ABC",
    "code": "abc1234567",
    "start_date": "2025-01-01",
    "end_date": "2025-12-31",
    "uri": "https://villding.s3.us-east-2.amazonaws.com/projects/uuid.jpg"
  },
  "users": [
    {
      "id": 5,
      "name": "Juan",
      "email": "juan@example.com",
      "uri": "https://villding.s3.us-east-2.amazonaws.com/profiles/uuid.jpg",
      "user_code": "A123456",
      "is_admin": true
    },
    {
      "id": 8,
      "name": "María",
      "email": "maria@example.com",
      "uri": "",
      "user_code": "B789012",
      "is_admin": false
    }
  ]
}
```

**Response (404 Not Found):**
```json
{
  "message": "Project not found"
}
```

---

### 15. Create Project Entities (Weeks/Days)
**POST** `/endpoint/project/entities/create`

Creates weeks and days for a project based on date range.

**Request Body:**
```json
{
  "project_id": 10,
  "start_date": "2025-01-01",
  "end_date": "2025-03-31",
  "numero_semanas": 13
}
```

**Response (200 OK):**
```json
{
  "message": "Semanas y días creados correctamente"
}
```

**Response (200 Already Created):**
Returns existing weeks if already created:
```json
[
  {
    "id": 1,
    "project_id": 10,
    "start_date": "2025-01-01",
    "end_date": "2025-01-07",
    "created_at": "2025-01-01T00:00:00.000000Z"
  }
]
```

---

### 16. Check Project Entities
**POST** `/endpoint/project/entities/check/{project_id}`

Checks if weeks have been created for a project.

**URL Parameters:**
- `project_id` (number) - Project ID

**Response (200 OK - if weeks exist):**
```json
[
  {
    "id": 1,
    "project_id": 10,
    "start_date": "2025-01-01",
    "end_date": "2025-01-07"
  }
]
```

**Response (200 OK - if no weeks exist):**
Returns empty response

---

## Complete React Native Example

```javascript
import React, { useState } from 'react';
import { View, TextInput, Button, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const CreateProjectScreen = () => {
  const [projectData, setProjectData] = useState({
    name: '',
    location: '',
    company: '',
    start_date: '',
    end_date: '',
    nearest_monday: '',
    project_type_id: 1,
  });
  const [imageUri, setImageUri] = useState(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const createProject = async () => {
    const formData = new FormData();

    formData.append('name', projectData.name);
    formData.append('location', projectData.location);
    formData.append('company', projectData.company);
    formData.append('start_date', projectData.start_date);
    formData.append('end_date', projectData.end_date);
    formData.append('nearest_monday', projectData.nearest_monday);
    formData.append('project_type_id', projectData.project_type_id);

    if (imageUri) {
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('uri', {
        uri: imageUri,
        name: filename,
        type: type,
      });
    }

    try {
      const response = await fetch('http://your-domain.com/endpoint/project/store', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();

      if (response.ok) {
        console.log('Project created successfully:', result);
        // Navigate to project list or show success message
      } else {
        console.error('Error creating project:', result);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Project Name"
        value={projectData.name}
        onChangeText={(text) => setProjectData({...projectData, name: text})}
      />
      <TextInput
        placeholder="Location"
        value={projectData.location}
        onChangeText={(text) => setProjectData({...projectData, location: text})}
      />
      <TextInput
        placeholder="Company"
        value={projectData.company}
        onChangeText={(text) => setProjectData({...projectData, company: text})}
      />
      <TextInput
        placeholder="Start Date (YYYY-MM-DD)"
        value={projectData.start_date}
        onChangeText={(text) => setProjectData({...projectData, start_date: text})}
      />
      <TextInput
        placeholder="End Date (YYYY-MM-DD)"
        value={projectData.end_date}
        onChangeText={(text) => setProjectData({...projectData, end_date: text})}
      />
      <TextInput
        placeholder="Nearest Monday (YYYY-MM-DD)"
        value={projectData.nearest_monday}
        onChangeText={(text) => setProjectData({...projectData, nearest_monday: text})}
      />

      <Button title="Pick Image" onPress={pickImage} />
      {imageUri && <Image source={{ uri: imageUri }} style={{ width: 200, height: 200 }} />}

      <Button title="Create Project" onPress={createProject} />
    </View>
  );
};

export default CreateProjectScreen;
```

---

## Important Notes

1. **Image Uploads:**
   - Images are uploaded to Amazon S3
   - Maximum size: 2MB
   - Supported formats: jpg, png, gif, etc.
   - Images are stored in the `projects/` folder with UUID filenames
   - Old images are automatically deleted when updating or deleting projects

2. **Date Format:**
   - All dates should be in format: `YYYY-MM-DD`
   - Example: `2025-01-15`

3. **Content-Type:**
   - For image uploads, use `multipart/form-data`
   - For JSON requests, use `application/json`

4. **Error Handling:**
   - Always check the response status code
   - Handle validation errors (422) by displaying field-specific errors
   - Handle not found errors (404) appropriately

5. **Session Management:**
   - Ensure user is logged in before making requests
   - API uses session-based authentication

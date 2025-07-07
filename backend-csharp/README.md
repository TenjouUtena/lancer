# Lancer API - C# ASP.NET Core

## Overview

This is the C# ASP.NET Core version of the Lancer backend, converted from the original Python Flask implementation.

## Features

- ASP.NET Core Web API
- Entity Framework Core with SQLite
- CORS enabled for cross-origin requests
- RESTful API endpoints matching the original Flask API

## API Endpoints

### Orders
- `GET /api/orders/top_5` - Get the last 5 orders

### Artists
- `GET /api/artists/top_5` - Get the top 5 artists
- `PUT /api/artists` - Create a new artist

## Setup and Running

### Prerequisites
- .NET 9.0 SDK or later

### Installation

1. Navigate to the project directory:
   ```bash
   cd backend-csharp/LancerApi
   ```

2. Restore dependencies:
   ```bash
   dotnet restore
   ```

3. Build the project:
   ```bash
   dotnet build
   ```

4. Run the application:
   ```bash
   dotnet run
   ```

The API will be available at `http://localhost:5223`

## Database

The application uses SQLite with Entity Framework Core. The database file `lancer.db` will be created automatically in the project directory when the application starts.

## CORS

CORS is configured to allow requests from any origin, method, and header.

## Models

The data models match the original Python models:
- ContactType
- Image
- Artist
- ArtistBase
- ArtistBaseTagSet
- ArtistBaseTag
- Customer
- CustomerImage
- Product
- Order
- OrderLine

## Development

To add new endpoints or modify existing ones, edit the controller files in the `Controllers` directory.

## Testing

You can test the API using tools like Postman, curl, or by integrating with the frontend application.

## Migration from Python Flask

This C# version maintains the same API contract as the original Python Flask backend, making it a drop-in replacement for the frontend.

## License

[Add your license information here]

## Contributing

[Add contributing guidelines here]

## Support

For issues or questions, please [contact information or issue tracker]."

# MScProject
Environment setup
This part explains how the development environment was set up to deploy the project on the cloud.
The development process is started by setting up the cloud environment. As mentioned before, for this project, I used Google Cloud, so firstly, a Google account is needed to create a Google Cloud project. Because some GCP services are not free, the 90-day trial was activated to get the necessary credits to use them for the project. 
For this project to operate, these services were mainly used:
1.	Google Cloud Spanner - A scalable, fully managed relational database service used for storing data in databases.
2.	Google App Engine (GAE) – a Platform that allows you to build and deploy applications without having to manage the underlying infrastructure.
3.	Google Cloud IAM (Identity and Access Management) - Used for managing access control to GCP services, including assigning permissions for various roles and services.
4.	Google Cloud Storage - Used for storing static files, logs, and other artifacts related to the project.
5.	Google Cloud Logging - Provides monitoring and debugging services for logging events and errors occurring within the system.
6.	Google Cloud Identity - Used for authentication and user management across the system for secure access.
7.	Google Cloud Build - A continuous integration and delivery (CI/CD) service used for building, testing, and deploying the application.
8.	Google Cloud SQL - A fully-managed relational database service used for specific SQL-based storage needs that are separate from Spanner.
9.	Google Cloud Identity - Used for authentication and user management across the system for secure access.
While usage of these services should be enough for the project to operate properly, here is a list of every single API and service that was activated before and during the development process:
 
Figure 1 - All enabled APIs and Services
The next step is creating a Service Account (Located in "IAM & Admin" > "Service Accounts."). For this account to work, there is a list of roles that it should have:
1.	Cloud Spanner Admin
2.	Kubernetes Engine Admin
3.	Cloud Build Editor
4.	Storage Admin
5.	Viewer
6.	Compute Admin
7.	Monitoring Viewer
8.	Logging Viewer
9.	Service Account User
The next step is setting up a database instance in Google Spanner. 
For this project, there was created one instance on Google Spanner and a few databases inside it.
It was mistakenly called ‘user-instance’, however, this instance is used by every service.
In user database, only one table is created to store user data, and the DDL statement for it is:
CREATE TABLE users (
  id STRING(36) NOT NULL,
  name STRING(256),
  email STRING(256) NOT NULL,
  password STRING(256),
  googleId STRING(256),
) PRIMARY KEY(id);;

In the opportunity database, there are two tables: opportunities and applications, their DDL statements are:
For Opportuinities table
CREATE TABLE Opportunities (
  OpportunityID STRING(36) NOT NULL,
  Title STRING(MAX) NOT NULL,
  Description STRING(MAX),
  Location STRING(MAX),
  Deadline DATE,
  PostedBy STRING(36) NOT NULL,
  EducationLevel STRING(MAX),
  SubjectFilters ARRAY<STRING(MAX)>,
) PRIMARY KEY(OpportunityID);;

For Applications table
CREATE TABLE Applications (
  OpportunityID STRING(36) NOT NULL,
  ApplicationID STRING(36) NOT NULL,
  UserID STRING(36) NOT NULL,
  ApplicationDate TIMESTAMP NOT NULL OPTIONS (
    allow_commit_timestamp = true
  ),
  MotivationLetter STRING(MAX),
  CVUrl STRING(MAX),
) PRIMARY KEY(OpportunityID, ApplicationID),
  INTERLEAVE IN PARENT Opportunities ON DELETE CASCADE;;

	And the last database, Messaging database, has two tables: Conversations and Messages.
	DDL for Conversations table:
CREATE TABLE Conversations (
  ConversationID STRING(36) NOT NULL,
  OpportunityID STRING(36) NOT NULL,
  CreatorID STRING(36) NOT NULL,
  ApplicantID STRING(36) NOT NULL,
  LastMessageTimestamp TIMESTAMP,
) PRIMARY KEY(ConversationID);;

	DDL for Messages table:
CREATE TABLE Messages (
  MessageID STRING(36) NOT NULL,
  ConversationID STRING(36) NOT NULL,
  SenderID STRING(36) NOT NULL,
  MessageContent STRING(MAX) NOT NULL,
  Timestamp TIMESTAMP NOT NULL,
) PRIMARY KEY(ConversationID, MessageID),
  INTERLEAVE IN PARENT Conversations ON DELETE CASCADE;;

	The last thing to set up on the Google Cloud is a storage bucket for CV files. It is created in the Cloud Storage service.
	After setting up everything on a GCP side, it is important to put some environmental variables so each service and frontend application can access everything created on Google Cloud.
The following code snippets were taken from .env files, they have different variables used in the project and their purpose is explained in more depth in the Development chapter.
.env for the frontend app:
REACT_APP_BACKEND_USER_URL=USER-SERVICE-URL
REACT_APP_GOOGLE_CLIENT_ID=GOOGLE-CLIENT-ID(for auth purposes)
REACT_APP_BACKEND_OPPORTUNITY_URL=OPPORTUNITY-SERVICE-URL
REACT_APP_BACKEND_SEARCH_URL= SEARCH-SERVICE-URL
REACT_APP_BACKEND_MESSAGING_URL= MESSAGING-SERVICE-URL

	.env for the User service:
PORT=5001
JWT_SECRET=jwt-secret
GOOGLE_CLIENT_ID=client-id
GOOGLE_CLIENT_SECRET=google-client-secret
SPANNER_PROJECT_ID=project-id
SPANNER_INSTANCE_ID=instance-id
SPANNER_DATABASE_ID=user-database-id

	.env for the Opportunity service:
PORT=5002
JWT_SECRET=jwt-secret
USER_SERVICE_URL=user-service-url 

SPANNER_PROJECT_ID=project-id
SPANNER_INSTANCE_ID=instance-id
SPANNER_DATABASE_ID=opportuinity-database-id
BUCKET_NAME=bucket-name (to store cvs)

	.env for the Search service
PORT=5003
JWT_SECRET=jwt-secret
USER_SERVICE_URL=user-service-url 

SPANNER_PROJECT_ID=project-id
SPANNER_INSTANCE_ID=instance-id
SPANNER_DATABASE_ID=opportunity-database-id

	.env for the messaging service
PORT=5004
SPANNER_PROJECT_ID=project-id
SPANNER_INSTANCE_ID=instance-id
SPANNER_DATABASE_ID=messaging-database-id
SPANNER_USERS_DATABASE_ID=user-database-id
SPANNER_OPPORTUNITY_DATABASE_ID=opportunity-database-id
USER_SERVICE_URL=user-service-url 
JWT_SECRET=jwt-secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=service-email-address
SMTP_PASS=app-password (created in the gmail account)

	These are necessary steps to prepare the project for deployment to the Google App Engine. The deployment is done using gcloud shell in the terminal, and is configured with app.yaml files (they are described in the Development chapter).
![image](https://github.com/user-attachments/assets/1af1f036-9ea1-4802-9fd3-7a0e19ebdc9d)

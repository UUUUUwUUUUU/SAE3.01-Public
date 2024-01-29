![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![NPM](https://img.shields.io/badge/NPM-%23CB3837.svg?style=for-the-badge&logo=npm&logoColor=white)

![SAE3.01-Logo](https://media.discordapp.net/attachments/712982120481554442/1201354774247899156/SAE_3.01_-_MaNaturotheque.png)

# SAE3.01-Adranth

TEAM Adranth (Thomas &amp; Adrien &amp; Antoine) pour SAE 3.01

&nbsp;

## 🛠️ How to dev

### Requirements

* [Visual Studio Code](https://code.visualstudio.com/download)
* [NodeJS](https://nodejs.org/en/download) ≥ v20.10.0 ⚠️⚠️⚠️

### Setting up the Development Environment (Windows only)

1. Ensure you have a local database `mysql://root@localhost:3306/` running, to do so :

    1. Install [XAMPP™](https://www.apachefriends.org/download.html)
    2. Launch XAMPP Control Panel, turn on Apache & MySQL

2. Clone the repository in Visual Studio Code or by running `gh repo clone UUUUUwUUUUU/SAE3.01-Public`
3. Create a new `.env` file in root, then add and complete the following

    ```env
    BASE_URL="http://localhost:3000/"
    SECRET_COOKIE_PASSWORD="..."
    SENDINBLUE_API_KEY="..."
    ```

4. Install the project dependencies by running:

    ```Shell
    npm i
     
    ```

5. Run the following commands in the terminal:  

    ```Shell
    npx prisma migrate dev --name init
     
    ```

    ```Shell
    npx prisma generate
     
    ```

6. Start the development server by running:

    ```Shell
    npm run dev
     
    ```

    Or build using:

    ```Shell
    npm run launch
     
    ```

    **Note:** Closing Visual Studio Code will also close the npm dev server

7. Open [http://localhost:3000/](http://localhost:3000/) in your browser to access the app

&nbsp;

## 🔧 Troubleshooting

### Resetting Prisma Database

⚠️ **Warning:** The following commands will reset your Prisma database. A prompt will ask for confirmation (y/n).

1. Run the following commands:

    ```Shell
    npx prisma migrate reset
     
    ```

    ```Shell
    npx prisma migrate dev
     
    ```

&nbsp;

### Performing a Clean Package Installation (node_modules reset)

📌 This will delete your current `/node_modules` and reinstall the packages.

1. Run the following command:

    ```Shell
    npm ci
     
    ```


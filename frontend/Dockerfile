FROM node:20-alpine

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /app

# Copy pnpm lock file and package file for better cache utilization
COPY pnpm-lock.yaml .
COPY package.json .

# Install dependencies using pnpm
RUN pnpm install

# Copy the restl of the application files
COPY . .

# Build the application
RUN pnpm run build

# Expose the application port
EXPOSE 5173

# Define the command to run the application
CMD [ "pnpm", "run", "preview" ]
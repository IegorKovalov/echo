# Echo Social Network - Client

## Overview

This is the front-end client for Echo Social Network, a social platform where posts expire after a certain time period. Think of it as a social network where your content doesn't stay forever - it echoes for a while, then fades away.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Running the App](#running-the-app)
- [Development Workflow](#development-workflow)
- [Component Structure](#component-structure)
- [State Management](#state-management)
- [Styling](#styling)
- [Common Tasks](#common-tasks)

## 🚀 Getting Started

### Prerequisites

Before you begin, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or newer)
- npm (comes with Node.js) or [yarn](https://yarnpkg.com/)

### Installation

1. Clone the repository (if you haven't already)
2. Navigate to the client directory:

```bash
cd echo-social-network/client
```

3. Install dependencies:

```bash
npm install
```

or with yarn:

```bash
yarn
```

## 📁 Project Structure

```
client/
├── node_modules/     # Project dependencies (created after npm install)
├── public/           # Static assets
├── src/              # Source code
│   ├── components/   # React components
│   ├── context/      # React Context for state management
│   ├── pages/        # Page components
│   ├── services/     # API services
│   ├── App.jsx       # Main app component
│   ├── main.jsx      # Entry point
│   └── index.css     # Global styles
├── .gitignore        # Git ignore file
├── package.json      # Project metadata and dependencies
├── vite.config.js    # Vite configuration
└── README.md         # This file
```

## ✨ Key Features

- **User authentication** (login, signup, password reset)
- **Profile management** with customizable details
- **Temporary posts** that expire after a set time
- **Feed view** showing current posts
- **Post creation** with text and image support
- **Post renewal** to extend expiration time
- **Responsive design** that works on mobile and desktop

## 🏃‍♀️ Running the App

To start the development server:

```bash
npm run dev
```

This will start the app in development mode. Open [http://localhost:5173](http://localhost:5173) in your browser to view it.

## 💻 Development Workflow

1. Make changes to the code
2. The browser will automatically reload when you save changes
3. Check the console for any errors
4. Commit your changes when a feature is complete

## 🧩 Component Structure

### Pages

Pages represent full screens in our application. They're found in `src/pages/`:

- `HomePage.jsx` - The main feed page
- `ProfilePage.jsx` - User profile page
- `LoginPage.jsx` - User login
- `SignupPage.jsx` - New user registration
- ...and more

### Components

Reusable UI components are in `src/components/`. Some key ones:

- `UI/PostForm.jsx` - Form for creating posts
- `UI/PostItem.jsx` - Individual post display
- `profile/ProfileLayout.jsx` - Layout for profile pages
- `Layout/Layout.jsx` - Main app layout with navigation

## 🔄 State Management

We use React Context API for state management. The contexts are in `src/context/`:

- `AuthContext.jsx` - Handles user authentication state
- `PostContext.jsx` - Manages posts data and operations
- `ToastContext.jsx` - Manages notifications/toasts
- `ViewTrackingContext.jsx` - Tracks post views

### Understanding Context and Prop Drilling

#### What is Prop Drilling?

"Prop drilling" happens when you need to pass data from a top-level component through many layers of child components. This can make your code harder to maintain:

```jsx
// Without Context (prop drilling)
function GrandparentComponent() {
	const userData = { name: "John" };
	return <ParentComponent userData={userData} />;
}

function ParentComponent({ userData }) {
	return <ChildComponent userData={userData} />;
}

function ChildComponent({ userData }) {
	return <p>Hello, {userData.name}!</p>;
}
```

#### How Context Solves This

React Context lets components access shared data without passing props through every level:

```jsx
// With Context
const UserContext = createContext();

function App() {
	const userData = { name: "John" };
	return (
		<UserContext.Provider value={userData}>
			<GrandparentComponent />
		</UserContext.Provider>
	);
}

function ChildComponent() {
	const userData = useContext(UserContext);
	return <p>Hello, {userData.name}!</p>;
}
```

### How Our Contexts Work

Our app uses several context providers to manage different types of state:

```jsx
// Example from App.jsx
<AuthProvider>
	<ToastProvider>
		<ViewTrackingProvider>
			<Routes>{/* App routes */}</Routes>
		</ViewTrackingProvider>
	</ToastProvider>
</AuthProvider>
```

Components can then access this state using hooks:

```jsx
// Using authentication context
const { user, loading } = useAuth();

// Using post context
const { posts, createPost } = usePost();
```

### The Echo Network's Post Management Solution

Our Echo social network faced a particular challenge with post management - we needed to:

1. Display posts in multiple places (home feed, profile pages, search results)
2. Handle post creation, deletion, and renewal from different components
3. Keep track of post expiration times across the app
4. Maintain consistent UI updates when posts change

#### Our PostContext Implementation

We solved this with a comprehensive `PostContext` that centralizes all post operations:

```jsx
// Simplified version of our PostContext
export const PostProvider = ({ children }) => {
	const [posts, setPosts] = useState([]);
	const [trendingPosts, setTrendingPosts] = useState([]);

	// Functions for fetching data
	const fetchPosts = async () => {
		/* ... */
	};
	const fetchUserPosts = async (userId) => {
		/* ... */
	};
	const fetchTrendingPosts = async () => {
		/* ... */
	};

	// Functions for post operations
	const createPost = async (postData) => {
		/* ... */
	};
	const updatePost = async (postId, postData) => {
		/* ... */
	};
	const deletePost = async (postId) => {
		/* ... */
	};
	const renewPost = async (postId) => {
		/* ... */
	};

	// Helper functions
	const getHoursLeft = (expiresAt) => {
		/* ... */
	};

	return (
		<PostContext.Provider
			value={{
				posts,
				trendingPosts,
				fetchPosts,
				fetchUserPosts,
				fetchTrendingPosts,
				createPost,
				updatePost,
				deletePost,
				renewPost,
				getHoursLeft,
			}}
		>
			{children}
		</PostContext.Provider>
	);
};
```

#### Benefits of Our Approach

1. **No prop drilling** - Components just import the `usePost` hook
2. **Shared logic** - Post operations work the same way across the app
3. **Automatic data updates** - When a post changes, all components see the update
4. **Cleaner component code** - Components focus on UI, not data management
5. **Easier testing** - We can test post operations independently

#### Example Component Usage

Instead of passing many props, our components simply use the context:

```jsx
// Before: Many props being passed
<ProfilePosts
	loadingPosts={loadingPosts}
	posts={posts}
	profileData={profileData}
	handleDeletePost={handleDeletePost}
	handleRenewPost={handleRenewPost}
	showExpiredPosts={showExpiredPosts}
	setShowExpiredPosts={setShowExpiredPosts}
	handleCreatePost={handleCreatePost}
	isSubmitting={isSubmitting}
	isOwnProfile={isOwnProfile}
/>;

// After: Using context
function ProfilePosts() {
	const { posts, deletePost, renewPost } = usePost();

	// Component logic here

	return (
		<div>
			{posts.map((post) => (
				<PostItem
					key={post._id}
					post={post}
					onDelete={deletePost}
					onRenew={renewPost}
				/>
			))}
		</div>
	);
}
```

### Creating a New Context

If you need to share state between components that aren't directly related:

1. Create a new file in `src/context/` (e.g., `MyContext.jsx`)
2. Set up the context and provider:

```jsx
import { createContext, useContext, useState } from "react";

// Create context
const MyContext = createContext();

// Provider component
export function MyProvider({ children }) {
	const [myState, setMyState] = useState(initialValue);

	// Functions to update state
	const updateMyState = (newValue) => {
		setMyState(newValue);
	};

	// Value to be provided
	const value = {
		myState,
		updateMyState,
	};

	return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
}

// Custom hook for using this context
export function useMyContext() {
	const context = useContext(MyContext);
	if (!context) {
		throw new Error("useMyContext must be used within a MyProvider");
	}
	return context;
}
```

3. Add the provider to your component tree:

```jsx
// In a parent component
import { MyProvider } from "../context/MyContext";

function App() {
	return (
		<MyProvider>
			<YourComponents />
		</MyProvider>
	);
}
```

## 🎨 Styling

The app uses:

- [Tailwind CSS](https://tailwindcss.com/) for styling
- Utility classes for most styling needs
- Custom CSS in `index.css` for global styles

Example of Tailwind usage:

```jsx
<div className="flex flex-col bg-gradient-to-b from-gray-900 to-gray-950">
	<p className="text-lg font-medium text-white">Hello World</p>
</div>
```

## 📝 Common Tasks

### Creating a New Component

1. Create a new file in the appropriate directory under `src/components/`
2. Import necessary libraries and hooks
3. Define your component
4. Export it for use in other files

Example:

```jsx
import React from "react";

export default function MyComponent() {
	return (
		<div className="my-4 p-4 bg-gray-800 rounded-lg">
			<h2 className="text-white">My New Component</h2>
		</div>
	);
}
```

### Fetching Data

We use service files to interact with the API. Example usage:

```jsx
import PostService from "../services/post.service";

// In a component or useEffect
const fetchPosts = async () => {
	try {
		const response = await PostService.getAllPosts();
		setPosts(response.data.posts);
	} catch (error) {
		console.error("Error fetching posts:", error);
	}
};
```

### Adding a New Page

1. Create a new file in `src/pages/`
2. Import necessary components
3. Define your page component
4. Add a route in `App.jsx`

### Using Context

To use a context in a component:

```jsx
import { useAuth } from "../context/AuthContext";

function MyComponent() {
	const { user, logout } = useAuth();

	return (
		<div>
			<p>Welcome, {user.username}!</p>
			<button onClick={logout}>Logout</button>
		</div>
	);
}
```

## 🤝 Need Help?

If you run into any issues:

1. Check the browser console for errors
2. Look for error messages in the terminal
3. Search for solutions online
4. Ask for help from team members

---

Happy coding! 🎉

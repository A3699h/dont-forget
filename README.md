# Don't Forget - Task Management Dashboard

A modern, responsive task management application built with React and Vite.

## Features

### 🎯 **Task Management**
- **Task Categories** with color-coded priorities:
  - 🟢 **Upcoming Tasks** - Fresh Mint (#81C784)
  - 🟡 **Due Today Tasks** - Warm Amber (#FFB74D)
  - 🔴 **Late Tasks** - Soft Red (#E57373)
  - 🔵 **Follow-Up Tasks** - Medium Sky Blue (#64B5F6)
  - 🟣 **High Priority Tasks** - Deep Coral (#F06292)

### 📊 **Dashboard Features**
- **Statistics Overview** - Real-time task counts by category
- **Task Cards** - Horizontal layout with task details, date/time, and priority
- **Search & Filter** - Find tasks quickly by name, description, or priority
- **Add New Tasks** - Modal form for creating new tasks
- **Task Actions** - View, edit, and delete functionality

### 🎨 **Professional UI**
- **Modern Sidebar** - Clean navigation with icons and user profile
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Professional Color Scheme** - Blue and white theme with accent colors
- **Smooth Animations** - Hover effects and transitions

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Navigate to the client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173`

## Usage

### Login
- Use any email and password to login (demo mode)
- Click "Login" to access the dashboard

### Dashboard Navigation
- **Dashboard** - Main task overview and management
- **Tasks** - Task-specific views
- **Projects** - Project management (coming soon)
- **Calendar** - Calendar integration (coming soon)
- **Team** - Team collaboration (coming soon)
- **Settings** - Application settings (coming soon)
- **Reports** - Analytics and reports (coming soon)

### Managing Tasks
1. **View Tasks** - All tasks are displayed as cards with priority colors
2. **Add New Task** - Click "Add New Task" button to create new tasks
3. **Search Tasks** - Use the search bar to find specific tasks
4. **Filter by Priority** - Use the dropdown to filter by task priority
5. **Task Actions** - Use the action buttons (👁️ ✏️ 🗑️) to view, edit, or delete tasks

## Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx          # Navigation sidebar
│   │   ├── Sidebar.css
│   │   ├── Dashboard.jsx        # Main dashboard component
│   │   ├── Dashboard.css
│   │   ├── TaskCard.jsx         # Individual task card
│   │   ├── TaskCard.css
│   │   ├── Layout.jsx           # Main layout wrapper
│   │   ├── Layout.css
│   │   └── login/
│   │       ├── Login.jsx        # Login component
│   │       └── Login.css
│   ├── App.jsx                  # Main app component
│   ├── App.css                  # Global styles
│   └── main.jsx                 # App entry point
├── public/
└── package.json
```

## Technologies Used

- **React 18** - Frontend framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **CSS3** - Styling with modern features
- **Responsive Design** - Mobile-first approach

## Color Palette

- **Primary Blue**: #006FA7
- **Upcoming Tasks**: #81C784 (Fresh Mint)
- **Due Today Tasks**: #FFB74D (Warm Amber)
- **Late Tasks**: #E57373 (Soft Red)
- **Follow-Up Tasks**: #64B5F6 (Medium Sky Blue)
- **High Priority Tasks**: #F06292 (Deep Coral)

## Future Enhancements

- [ ] User authentication and authorization
- [ ] Backend API integration
- [ ] Real-time task updates
- [ ] Task categories and tags
- [ ] Calendar integration
- [ ] Team collaboration features
- [ ] Mobile app
- [ ] Dark mode support
- [ ] Task templates
- [ ] Export/Import functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
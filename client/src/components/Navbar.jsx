function Navbar({ theme, onToggleTheme }) {
    return (
        <nav className="navbar app-navbar shadow-sm">
            <div className="container-fluid gap-3">
                <span className="navbar-brand mb-0 h1">M.A.Y Project Management</span>
                <button
                    type="button"
                    className="btn btn-outline-light app-theme-toggle"
                    onClick={onToggleTheme}
                    aria-label={`Switch to ${theme === "light" ? "night" : "day"} mode`}
                >
                    {theme === "light" ? "Night Mode" : "Day Mode"}
                </button>
            </div>
        </nav>
    );
}

export default Navbar;

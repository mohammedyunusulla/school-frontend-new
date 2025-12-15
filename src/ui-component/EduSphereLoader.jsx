import '../scss/EduSphereLoader.css'


const EduSphereLoader = ({ loading, size = 50 }) => {
    if (!loading) return null;

    return (
        <div className="edusphere-overlay">
            <div className="loader-container">
                {/* Animated Ring Loader */}
                <div className="ring-loader" style={{ width: size, height: size }}>
                    <div className="ring"></div>
                    <div className="ring"></div>
                    <div className="ring"></div>
                </div>

                {/* Brand Name with Logo Colors */}
                <div className="brand-name">
                    <span className="edu">Edu</span>
                    <span className="sphere">Sphere</span>
                </div>
            </div>
        </div>
    );
};

export default EduSphereLoader;






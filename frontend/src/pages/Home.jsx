function Home() {
  return (
    <div className="container" style={{ backgroundColor: '#c99cb6', minHeight: '100vh' }}>
      <h1>WELCOME TO OCEANIC TOUR BOOKING SYSTEM</h1>
      <marquee><p>Explores  the beauty of  Zanzibar's tours easily and securely.</p></marquee>
      
      <div style={styles.imageContainer}>
        <div style={styles.imageWrapper}>
          <img 
            src="http://127.0.0.1:8000/static/core/images/beach.jpg" 
            alt="Beach" 
            style={styles.image}
          />
          <p style={styles.caption}>Beautiful Beach</p>
        </div>
        <div style={styles.imageWrapper}>
          <img 
            src="http://127.0.0.1:8000/static/core/images/boat.jpg" 
            alt="Boat" 
            style={styles.image}
          />
          <p style={styles.caption}>Zanzibar stone town</p>
        </div>
        <div style={styles.imageWrapper}>
          <img 
            src="http://127.0.0.1:8000/static/core/images/sunset.jpg" 
            alt="Sunset" 
            style={styles.image}
          />
          <p style={styles.caption}>Amazing Sunset</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  imageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    marginTop: '40px',
    flexWrap: 'wrap',
  },
  imageWrapper: {
    textAlign: 'center',
    width: '300px',
  },
  image: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(175, 6, 6, 0.2)',
  },
  caption: {
    marginTop: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#080808',
  },
};

export default Home;

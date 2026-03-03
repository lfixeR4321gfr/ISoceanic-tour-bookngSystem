function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.section}>
          <h3 style={styles.title}>OCEANIC TOUR BOOKING</h3>
          <p style={styles.text}>Your trusted partners in  Zanzibar</p>
        </div>
        
        <div style={styles.section}>
          <h4 style={styles.subtitle}>You can visit by clicking here</h4>
          <ul style={styles.list}>
            <li><a href="/" style={styles.link}>Home</a></li>
            <li><a href="/about" style={styles.link}>About</a></li>
            <li><a href="/contact" style={styles.link}>Contact</a></li>
            <li><a href="/tours" style={styles.link}>Tours</a></li>
          </ul>
        </div>
        
        <div style={styles.section}>
          <h4 style={styles.subtitle}>Contact Us</h4>
          <ul style={styles.list}>

            <li style={styles.text}>Email: allyfaki324@gmail.com</li>

            <li style={styles.text}>Email: info@oceanictours.com</li>
            <li style={styles.text}>Whatsapp: +255627496194</li>
            <li style={styles.text}>Address: Zanzibar, Tanzania</li>
          </ul>
        </div>
      </div>
      
      <div style={styles.bottom}>
        <p style={styles.copyright}>© 2026 Oceanic Tour Booking System. All rights reserved.</p>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: '#2c3e50',
    color: '#1b9bd6',
    padding: '40px 20px 20px',
    marginTop: '60px',
  },
  container: {
    display: 'flex',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    maxWidth: '1200px',
    margin: '0 auto',
    gap: '30px',
  },
  section: {
    minWidth: '200px',
  },
  title: {
    fontSize: '20px',
    marginBottom: '10px',
    color: '#08e049',
  },
  subtitle: {
    fontSize: '16px',
    marginBottom: '15px',
    color: '#10bce7',
  },
  text: {
    fontSize: '14px',
    color: '#0e71b3',
    marginBottom: '8px',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  link: {
    color: '#c45c8c',
    textDecoration: 'none',
    fontSize: '14px',
    display: 'block',
    marginBottom: '8px',
  },
  bottom: {
    textAlign: 'center',
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '1px solid #34495e',
  },
  copyright: {
    fontSize: '14px',
    color: '#33df11',
  },
};

export default Footer;

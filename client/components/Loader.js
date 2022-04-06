import styles from '../styles/Loader.module.css';

const Loader = () => {
  return (
    <div className={`${styles.Loader} relative w-10 h-10 flex justify-center`}>
      {[...Array(20).keys()].map((i) => (
        <li key={i} style={{ '--i': i + 1 }}></li>
      ))}
    </div>
  );
};

export default Loader;

import schoolLogo from 'assets/images/EduSphere.png';


export default function Logo({ height }) {

  return (
    <img
      src={schoolLogo}
      alt="Smart School Logo"
      style={{ height: height ?? 50, objectFit: 'contain' }}
    />
  );
}

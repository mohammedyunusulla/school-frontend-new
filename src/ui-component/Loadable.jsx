import { Suspense } from 'react';

// project imports
import EduSphereLoader from './EduSphereLoader';

export default function Loadable(Component) {
  const WrappedComponent = (props) => (
    <Suspense fallback={<EduSphereLoader />}>
      <Component {...props} />
    </Suspense>
  );

  return WrappedComponent;
}

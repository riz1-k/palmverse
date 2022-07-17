import React from 'react';

import styleClasses from './Steps.module.scss';

type TypeStepsProps = {
  children: React.ReactNode;
};

const Steps: React.FC<TypeStepsProps> = (props: TypeStepsProps) => {
  return (
    <div className="flex py-10 justify-start w-[740px] px-5 ">
      {props.children}
    </div>
  );
};

export default Steps;

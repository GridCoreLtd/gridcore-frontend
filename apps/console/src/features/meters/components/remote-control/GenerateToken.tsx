import type { FC} from "react";
import React, { useState } from "react";

import { useSearchParams } from "react-router-dom";


import Button from "@gridcore/ui/components/Button";
import SlideOver from "@gridcore/ui/components/overlays/SlideOver";

import { ClearMeterTamper } from "../ClearMeterTamper";

type Props = {
  meterId: string;
};

const GenerateToken: FC<Props> = ({ meterId }) => {
  const meterBrand = useSearchParams()[0].get("meterBrand");
  const [isActive, setIsActive] = useState(false);
  return (
    <>
      <div className="sm:flex items-center gap-5">
        <p>
          Meter ID: <span>{meterId}</span>
        </p>
        <Button
          onClick={() => setIsActive(true)}
          text="Clear Tamper"
          className="w-full sm:max-w-fit"
        />
      </div>
      <SlideOver
        title="Clear Meter Tamper"
        open={isActive}
        setOpen={setIsActive}
      >
        <ClearMeterTamper
          meterId={meterId}
          closeSlideOver={() => setIsActive(false)}
          meterBrand={meterBrand ?? ""}
        />
      </SlideOver>
    </>
  );
};

export default GenerateToken;

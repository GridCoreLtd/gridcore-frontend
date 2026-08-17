import Button from "@gridcore/ui/components/Button";

interface TopupSuccessProps {
  closeModal: (value: boolean) => void;
  token: string;
  meter: any;
}

const TopupSuccess = ({ closeModal, token, meter, }: TopupSuccessProps) => {
  return (
    <section className="text-center">
      <img
        src="/icons/success.svg"
        alt="Success icon"
        className="w-20 h-20 mx-auto"
      />

      <div className="text-xl font-bold mt-4">Congratulation!</div>
      {meter?.meterType == "OKRA"? <>Successful top up.</>: <>
      {(token) ? <div>{`Below is your ${meter?.meterType.toLowerCase()} token:`}</div>:  <div>{`Your wallet debt balance has been paid.`}</div>}
      </>}

      {token && <div className="my-4 text-[1.5rem] font-bold text-gray-500">{token}</div>}
      
      <Button
        text="OK, thanks!"
        onClick={() => closeModal(false)}
        width="100%"
      />
    </section>
  );
};

export default TopupSuccess;

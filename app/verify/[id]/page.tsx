"use client";
import Loading from "@/components/Loading";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import CertificateVerification from "@/artifacts/contracts/CertificateVerify.sol/CertificateVerification.json";
import { ethers } from "ethers";

function Verify({ params }: { params: { id: string } }) {
    const [verified, setVerified] = useState(false);
    const [loading, setLoading] = useState(true);
    const [certImg, setCertImg] = useState("");
    const [provider, setProvider] = useState<ethers.Provider | null>(null);
    const [wallet, setWallet] = useState<string>("");

    const contractAddress = "0x13689bC9Ca59811178330cD3f5dB9a831706472e";

    useEffect(() => {
        async function verifyCert() {
            if (window.ethereum == null) {
                console.log("MetaMask not installed");
                setProvider(new ethers.JsonRpcProvider(`https://polygon-mumbai.infura.io/v3/${process.env.INFURA_API_KEY}`));
            } else {
                window.ethereum.request({ method: "eth_requestAccounts" }).then(async (accounts: string[]) => {
                    setWallet(accounts[0]);
                    setProvider(new ethers.BrowserProvider(window.ethereum));
                });
            }
            setLoading(true);

            const contract = new ethers.Contract(
                contractAddress,
                CertificateVerification.abi,
                provider
            );

            try {
                const response = await contract.getCertificate(params.id);
                console.log("response:", response);
                setCertImg(response.imgHash);
                setLoading(false);
                setVerified(true);
                console.log("verified");
            } catch (error) {
                setLoading(false);
                setVerified(false);
            }
            return () => {
                setLoading(false);
                setVerified(false);
            }
        }
        verifyCert();
    }, [])

    return (

        <div className='w-full min-h-screen bg-white text-black'>
            {loading ? <Loading /> : <div>
                {verified ?
                    <div>
                        <div className="flex md:flex-row flex-col w-full h-full p-10 justify-center items-center">
                            <Image
                                src="/verified.gif"
                                width={70}
                                height={70}
                                alt="Picture of the author"
                                className="p-2"
                            />
                            <div className="text-[30px] md:text-[60px] text-black text-center">Your Certificate is verified</div>

                        </div>
                        <div className="flex w-full justify-center">
                            <img src={certImg} width={500} height={500} />

                        </div>
                    </div> : <div>This Certificate is invalid</div>}
            </div>}
        </div>
    )
}

export default Verify
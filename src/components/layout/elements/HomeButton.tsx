import { useScreenSize } from '@elements/Listener';
import { useTheme } from '@providers/Themes';
import localFont from 'next/font/local';
import Link from 'next/link';
import React from 'react';

// TODO : Améliorer path
const Hiruko = localFont({ src: '../../../../lib/font/HirukoProBlack.ttf' });

const HomeButton: React.FC = () => {
    const { theme } = useTheme();
    const isPhoneSize = useScreenSize(750);

    const buttonColor = theme === 'light' ? 'white' : 'black';
    const buttonColorInverse = theme === 'light' ? 'grey' : 'darkgray';

    return (
        <Link href="/" as="/" style={{ textDecoration: 'none' }}>
            <main className={Hiruko.className}>
                <div className="navbar-brand d-flex" style={{ marginRight: '0' }}>
                    <div style={{
                        width: '30px',
                        height: '30px',
                        backgroundColor: buttonColorInverse,
                        borderRadius: '5px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <span style={{ userSelect: 'none', color: buttonColor }}>N</span>

                    </div>
                    <span style={{ marginLeft: '0.3vw' }}></span>
                    {!isPhoneSize &&
                        <div>
                            <span style={{ userSelect: 'none' }}>NATUROTHÈQUE</span>
                        </div>
                    }
                </div>
            </main>
        </Link>
    );
};

export default HomeButton;
import { Button } from '@enact/sandstone/Button';
import { Image } from '@enact/sandstone/Image';
import Popup from '@enact/sandstone/Popup';
import CardMedia from '@mui/material/CardMedia';

import * as React from 'react';
import { useState } from 'react';

import './WineModal.css'
import axios from 'axios';
import { DATABASE_IP } from '../database';

function Modal({ onClose, wineArray, idx, deleteWine, cellar_id }) {
    const [wine,setWine] = useState(wineArray[idx].wine_id);

    const applyChanges = () => {
        //Wine drink POST
        axios.post(`${DATABASE_IP}:3000/winecellar/`, {
            row: wineArray[idx].row,
            col: wineArray[idx].col,
            cellarid: cellar_id
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: 'Bearer token'
            }
        })
        .then(response => {
            // 요청 성공 시 처리할 코드
            console.log(response.data);
        })
        .catch(error => {
            // 요청 실패 시 처리할 코드
            console.error(error);
        });
        onClose(); // 모달 닫기
    };

    return (
        <div className="modal-container">
            <div>
                <h2>Wine Information</h2>
                <div className="modal-layout">
                    <div className="modal-image">
                        <div className="image-style">
                            <CardMedia
                                component="img"
                                image={wine.imgsrc}
                                alt="wine"
                            />
                        </div>
                    </div>
                    <div className="modal-content">
                        <div className="modal-content-title">
                            <div>{wine.type}</div>
                            <h2>{wine.eng_name}</h2>
                        </div>
                        <div className="modal-content-aroma">
                            Aroma
                            <ImgAndTextPanel array={wine.aroma} />
                        </div>
                        <div className="modal-content-pairing">
                            Pairing
                            <ImgAndTextPanel array={wine.pairing} />
                        </div>
                        <div className="modal-content-inf-box">
                            <div className="modal-content-rating-box">
                                <Rating name={"Sweet"} value={wine.sweet} />
                                <Rating name={"Acid"} value={wine.acid} />
                                <Rating name={"Body"} value={wine.body} />
                                <Rating name={"Tannin"} value={wine.tannin} />
                            </div>
                            <div className="modal-content-inf">{wine.price !== 0 ? `Price: ₹${wine.price}` : 'Price: No info'}</div>
                            <div className="modal-content-inf">temperature: {wine.temp}°C</div>
                        </div>
                        <div className="modal-content-btn">
                            <Button onClick={applyChanges}>Drink</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const ImgPanel = ({ imgsrc, category }) => {
    return (
        <div className="item-box">
            <Image src={imgsrc} style={{ height: 64, width: 64 }}/>
            {category}
        </div>
    );
}

const ImgAndTextPanel = ({ array }) => {
    if (array === null) {
        return <div className="item-layout">No info</div>;
    } else {
        const panelArray = array.map((item, index) => (
            <div key={index}>
                <ImgPanel imgsrc={item.imgsrc} category={item.category} />
            </div>
        ));

        return <div className="item-layout">{panelArray}</div>;
    }
};

const Rating = ({ name, value }) => {
    const renderCircles = () => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            if (i < value) {
                stars.push(<span key={i} className="star filled">&#9733;</span>);
            } else {
                stars.push(<span key={i} className="star">&#9733;</span>);
            }
        }
        return stars;
    };

    return (
        <div className="rating">
            <div className="rating-name">{name}</div>
            <div>{renderCircles()}</div>
        </div>
    );
};

const WineModal = ({ isOpen, onClose, wineArray, idx, deleteWine, cellar_id }) => {
    return (
        <Popup open={isOpen} onClose={onClose} position="center">
            <Modal onClose={onClose} wineArray={wineArray} idx={idx} deleteWine={deleteWine} cellar_id={cellar_id}/>
        </Popup>
    );
};

export default WineModal;
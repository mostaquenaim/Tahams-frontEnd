import React, { useEffect, useState } from 'react';
import useAxiosPublic from '../../../../Hooks/useAxiosPublic';

const ListListComponent = ({ sub, ListStyle }) => {
    const axiosPublic = useAxiosPublic();

    const [cats, setCats] = useState([]);
    const [printedCats, setPrintedCats] = useState([]);

    const xtraClass = 'opacity-80 text-sm';

    useEffect(() => {
        axiosPublic.get(`/admin/view-product-sub-sub-category/${sub.id}`)
            .then(res => {
                const all = res.data || [];

                const printed = all.filter(cat =>
                    cat.name.toLowerCase().includes('printed')
                );

                const nonPrinted = all
                    .filter(cat =>
                        !cat.name.toLowerCase().includes('printed')
                    )
                    .sort((a, b) =>
                        a.name.localeCompare(b.name)
                    );

                setPrintedCats(printed);
                setCats(nonPrinted);
            });
    }, [axiosPublic, sub.id]);

    const renderListItems = (items) =>
        items.map(cat => (
            <ListStyle
                key={cat.id}
                goto={`/products/${cat.id}`}
                pageName={cat.name}
                extraClass={xtraClass}
            />
        ));

    return (
        <div className="space-y-3">
            {sub.isEnablePremium ? (
                <>
                    <p className="text-sm underline">Elite</p>
                    {renderListItems(cats.filter(cat => cat.isPremium))}

                    <p className="text-sm underline">Regular</p>
                    {renderListItems(cats.filter(cat => !cat.isPremium))}
                </>
            ) : (
                <>
                    {renderListItems(cats)}

                    {printedCats.length > 0 && (
                        <>
                            <p className="text-sm underline">Printed</p>
                            {renderListItems(printedCats)}
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default ListListComponent;

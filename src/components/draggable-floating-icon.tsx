import { useRef } from 'react';
/**
 * Handling Floating Icon Drag Factory
 * @param {string} elmId Floating Icon ID
 * @param {boolean} [disableDragFeature=false] is Disable Drag Feature or not?
 * @param {boolean | {desktop: boolean, mobile: boolean}} [showFullSizeOpt=false] no hide a half after move
 * @returns
 */

const maxMobileWidth = 768;

const isScaled = (floatingIcon: any): any => {
    const style: any = window.getComputedStyle(floatingIcon);
    const transform = style.transform || style.mozTransform;

    if (transform && transform !== 'none') {
        const scaleRegex = /matrix\(([\d.,\s-]+)\)/;
        const match = transform.match(scaleRegex);

        if (match) {
            const matrixValues = match[1].split(',');
            const scaleX = parseFloat(matrixValues[0]);
            const scaleY = parseFloat(matrixValues[3]);

            return scaleX !== 1 || scaleY !== 1;
        }
    }

    return false;
};

const getClients = (e: any) => ({
    clientX: e?.touches?.[0]?.clientX || e.clientX,
    clientY: e?.touches?.[0]?.clientY || e.clientY,
});

const isInLeft = (floatingIcon: any) => {
    const currentX = floatingIcon.getBoundingClientRect().x + floatingIcon.scrollWidth / 2;
    const widthMiddle = window.innerWidth / 2;
    return currentX < widthMiddle;
};

const createDraggableFloatingIcon = ({ disableDragFeature = false, showFullSizeOpt = false }) => {
    let backupOverflow: any;
    let timeout: any = null;

    function dropHandler(e: any) {
        e?.preventDefault();
        e?.stopPropagation();
    }

    const moveToEdge = (floatingIcon: any, showAHalf = false) => {
        if (isInLeft(floatingIcon)) {
            floatingIcon.style.left = '0px';
            floatingIcon.style.right = 'auto';
            floatingIcon.style.transformOrigin = 'left center';
        } else {
            floatingIcon.style.right = '0px';
            floatingIcon.style.left = 'auto';
            floatingIcon.style.transformOrigin = 'right center';
        }

        if (showAHalf) {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const position = -floatingIcon.scrollWidth / 2 + 'px';
                floatingIcon.style.transition = 'all 0.5s ease-out';

                if (isInLeft(floatingIcon)) {
                    floatingIcon.style.left = position;
                    floatingIcon.style.transformOrigin = (isScaled as any) ? 'center center' : 'left center';
                } else {
                    floatingIcon.style.right = position;
                    floatingIcon.style.transformOrigin = (isScaled as any) ? 'center center' : 'right center';
                }
            }, 1500);
        }
    };

    return {
        handleDrag(e: any) {
            if (disableDragFeature) return;

            const floatingIcon = e.currentTarget;
            const floatingContainer = floatingIcon.getBoundingClientRect();
            const { clientY, clientX } = getClients(e);

            const currentLeft = floatingContainer.left;
            const currentTop = floatingContainer.top;
            const currentX = (currentLeft + floatingContainer.right) / 2;
            const currentY = (currentTop + floatingContainer.bottom) / 2;
            const width = window.innerWidth - floatingIcon.scrollWidth;
            const height = window.innerHeight - floatingIcon.scrollHeight;

            let left = currentLeft - (currentX - clientX);
            let top = currentTop - (currentY - clientY);
            left = Math.min(Math.max(0, left), width);
            top = Math.min(Math.max(0, top), height);

            floatingIcon.style.top = top + 'px';
            floatingIcon.style.bottom = 'auto';
            floatingIcon.style.zIndex = '9999';

            if (isInLeft(floatingIcon)) {
                floatingIcon.style.left = left + 'px';
                floatingIcon.style.right = 'auto';
            } else {
                floatingIcon.style.right = width - left + 'px';
                floatingIcon.style.left = 'auto';
            }
        },

        handleDragEnd(e: any) {
            if (disableDragFeature) return;

            document.body.removeEventListener('dragover', dropHandler);
            document.body.removeEventListener('touchmove', dropHandler, { passive: false } as any);
            document.body.style.overflow = backupOverflow;

            const floatingIcon = e.currentTarget;
            floatingIcon.style.transition = 'all 0.5s ease-out';

            const viewType = window.innerWidth > maxMobileWidth ? 'desktop' : 'mobile';
            const showAHalf = typeof showFullSizeOpt === 'boolean' ? !showFullSizeOpt : !showFullSizeOpt?.[viewType];

            moveToEdge(floatingIcon, showAHalf);
        },

        handleDragStart(e: any) {
            if (disableDragFeature) return;
            // Add transparent image to hide ghost
            const transparentImage = new Image();
            transparentImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgMBA6p9T8cAAAAASUVORK5CYII='; // 1x1 transparent PNG
            e.dataTransfer?.setDragImage(transparentImage, 0, 0);

            document.body.addEventListener('dragover', dropHandler);
            document.body.addEventListener('touchmove', dropHandler, { passive: false });

            const floatingIcon = e.currentTarget;
            floatingIcon.style.transition = 'unset';

            backupOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
        },
    };
};

const DraggableFloatingIcon = ({ customClass, containerStyle, children, disableDragFeature, showFullSizeOpt }: any) => {
    const floatingIconRef = useRef(createDraggableFloatingIcon({ disableDragFeature, showFullSizeOpt }));
    const floatingIconProps = {
        onTouchStart: floatingIconRef.current.handleDragStart,
        onTouchMove: floatingIconRef.current.handleDrag,
        onTouchEnd: floatingIconRef.current.handleDragEnd,
        onDragStart: floatingIconRef.current.handleDragStart,
        onDrag: floatingIconRef.current.handleDrag,
        onDragEnd: floatingIconRef.current.handleDragEnd,
        draggable: true,
    };

    return (
        <div className={customClass} style={containerStyle} {...floatingIconProps}>
            {children}
        </div>
    );
};

export default DraggableFloatingIcon;

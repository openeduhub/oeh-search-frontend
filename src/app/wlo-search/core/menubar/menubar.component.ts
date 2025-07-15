import {
    Component,
    computed,
    ElementRef,
    HostListener,
    Signal,
    signal,
    ViewChild,
    WritableSignal,
} from '@angular/core';
import { ConfigService } from '../config.service';
import { SkipNavService, SkipTarget } from '../skip-nav.service';

@Component({
    selector: 'app-menubar',
    templateUrl: './menubar.component.html',
    styleUrls: ['./menubar.component.scss'],
    standalone: false,
})
export class MenubarComponent {
    readonly routerPath: string = this.config.get().routerPath;
    readonly wordpressUrl: string = this.config.get().wordpressUrl;
    private readonly MOBILE_WIDTH: number = 1024;

    @HostListener('window:resize') onResize(): void {
        this.width.set(window.innerWidth);
    }
    @ViewChild('mainMenu') mainMenu: ElementRef;
    @ViewChild('newsSubMenu') newsSubMenu: ElementRef;
    @ViewChild('wloSubMenu') wloSubMenu: ElementRef;

    isMobile: Signal<boolean> = computed((): boolean => this.width() < this.MOBILE_WIDTH);
    mobileMenuOpen: boolean = false;
    newsSubMenuOpen: WritableSignal<boolean> = signal(false);
    wloSubMenuOpen: WritableSignal<boolean> = signal(false);

    private readonly isTouchDevice: boolean;
    private newsTimeout: ReturnType<typeof setTimeout> | null;
    private width: WritableSignal<number> = signal(window.innerWidth);
    private wloTimeout: ReturnType<typeof setTimeout> | null;

    constructor(private config: ConfigService, private skipNav: SkipNavService) {
        this.isTouchDevice =
            // From https://stackoverflow.com/a/4819886
            'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    /**
     * Simulate the animation of the WLO menubar.
     */
    toggleMobileMenu(): void {
        const menuElement = this.mainMenu?.nativeElement;
        if (!menuElement) {
            // as fallback, continue without animation
            this.mobileMenuOpen = !this.mobileMenuOpen;
        }
        // apply animation classes
        if (!this.mobileMenuOpen) {
            this.mobileMenuOpen = true;
            menuElement.classList.add('fade-in', 'mui-enter');
            setTimeout((): void => {
                menuElement.classList.add('mui-enter-active');
                setTimeout((): void => {
                    menuElement.classList.remove('mui-enter', 'mui-enter-active');
                }, 400);
            }, 100);
        } else {
            menuElement.classList.add('fade-out', 'mui-leave');
            setTimeout((): void => {
                menuElement.classList.add('mui-leave-active');
                setTimeout((): void => {
                    this.mobileMenuOpen = false;
                    menuElement.classList.remove('mui-leave', 'mui-leave-active');
                }, 250);
            }, 250);
        }
    }

    /**
     * Change given news menu open state, if not in mobile mode.
     *
     * @param newsMenuOpen
     */
    changeNewsMenuOpen(newsMenuOpen: boolean): void {
        clearTimeout(this.newsTimeout);
        if (this.isMobile()) {
            return;
        }
        // delay, when closing
        if (!newsMenuOpen) {
            this.newsTimeout = setTimeout((): void => {
                this.newsSubMenuOpen.set(newsMenuOpen);
            }, 500);
        } else {
            this.newsSubMenuOpen.set(newsMenuOpen);
        }
    }

    /**
     * Change given WLO menu open state, if not in mobile mode.
     *
     * @param wloMenuOpen
     */
    changeWloMenuOpen(wloMenuOpen: boolean): void {
        clearTimeout(this.wloTimeout);
        if (this.isMobile()) {
            return;
        }
        // delay, when closing
        if (!wloMenuOpen) {
            this.wloTimeout = setTimeout((): void => {
                this.wloSubMenuOpen.set(wloMenuOpen);
            }, 500);
        } else {
            this.wloSubMenuOpen.set(wloMenuOpen);
        }
    }

    /**
     * News link click event, which is relevant for both touch and mobile devices.
     *
     * @param event
     */
    onNewsLinkClicked(event: MouseEvent): void {
        if (this.isTouchDevice || this.isMobile()) {
            // simulate the animation of the News sub menu in mobile view
            // only necessary for the closing effect
            if (this.isMobile() && this.newsSubMenu?.nativeElement && this.newsSubMenuOpen()) {
                const menuElement = this.newsSubMenu?.nativeElement;
                menuElement.classList.add('is-closing');
                setTimeout(() => {
                    this.newsSubMenuOpen.set(!this.newsSubMenuOpen());
                    menuElement.classList.remove('is-closing');
                }, 100);
            } else {
                this.newsSubMenuOpen.set(!this.newsSubMenuOpen());
            }
            event.preventDefault();
        }
    }

    /**
     * WLO link click event, which is relevant for both touch and mobile devices.
     *
     * @param event
     */
    onWloLinkClicked(event: MouseEvent): void {
        if (this.isTouchDevice || this.isMobile()) {
            // simulate the animation of the WLO sub menu in mobile view
            // only necessary for the closing effect
            if (this.isMobile() && this.wloSubMenu?.nativeElement && this.wloSubMenuOpen()) {
                const menuElement = this.wloSubMenu?.nativeElement;
                menuElement.classList.add('is-closing');
                setTimeout(() => {
                    this.wloSubMenuOpen.set(!this.wloSubMenuOpen());
                    menuElement.classList.remove('is-closing');
                }, 100);
            } else {
                this.wloSubMenuOpen.set(!this.wloSubMenuOpen());
            }
            event.preventDefault();
        }
    }

    /**
     * Skip menu to given target.
     *
     * @param target
     */
    skipTo(target: SkipTarget): void {
        this.skipNav.skipTo(target);
    }
}

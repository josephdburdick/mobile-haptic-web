import { useRef, useState } from "react"
import { Drawer } from "vaul"
import { useHaptics } from "@j0e/haptic-text/use-haptics"

type DrawerSelectSlideProps = { soundEnabled?: boolean }

const FRUITS = ["Apple", "Banana", "Cherry", "Dragonfruit", "Elderberry", "Fig", "Grape", "Honeydew"]
const TOPPINGS = ["Pepperoni", "Mushrooms", "Onions", "Sausage", "Bell Peppers", "Olives", "Jalapeños", "Pineapple"]
const COUNTRIES = [
  "Argentina", "Australia", "Brazil", "Canada", "Chile", "Colombia",
  "Denmark", "Egypt", "Finland", "France", "Germany", "Greece",
  "India", "Ireland", "Italy", "Japan", "Kenya", "Mexico",
  "Netherlands", "New Zealand", "Norway", "Peru", "Portugal",
  "South Korea", "Spain", "Sweden", "Thailand", "United Kingdom",
  "United States", "Vietnam",
]

function ChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6l4 4 4-4" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 8.5l3 3 6-7" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.5 10.5L14 14" />
    </svg>
  )
}

// --- Single Select ---

function SingleSelect({ soundEnabled }: { soundEnabled?: boolean }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState<string | null>(null)
  const { trigger } = useHaptics({ debug: soundEnabled })
  const contentRef = useRef<HTMLDivElement | null>(null)

  return (
    <div className="dsField">
      <label className="dsLabel">Favorite Fruit</label>
      <Drawer.Root
        open={open}
        onOpenChange={setOpen}
        snapPoints={[0.55]}
        modal
      >
        <Drawer.Trigger asChild>
          <button type="button" className="dsTrigger">
            <span className={value ? "dsTriggerValue" : "dsTriggerPlaceholder"}>
              {value ?? "Select a fruit…"}
            </span>
            <ChevronDown />
          </button>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className="drawerOverlay" />
          <Drawer.Content
            className="drawerContent dsDrawerContent"
            ref={contentRef}
            tabIndex={-1}
            onOpenAutoFocus={(e) => { e.preventDefault(); contentRef.current?.focus() }}
          >
            <Drawer.Handle className="drawerHandle" />
            <div className="drawerBody">
              <Drawer.Title className="drawerTitle">Pick a Fruit</Drawer.Title>
              <Drawer.Description className="dsDescription">
                Tap an option to select it.
              </Drawer.Description>
              <div className="dsOptionList" role="listbox">
                {FRUITS.map((fruit) => (
                  <button
                    key={fruit}
                    type="button"
                    className="dsOption"
                    role="option"
                    aria-selected={value === fruit}
                    data-selected={value === fruit}
                    onClick={() => {
                      setValue(fruit)
                      trigger("selection")
                      setOpen(false)
                    }}
                  >
                    <span>{fruit}</span>
                    {value === fruit && <CheckIcon />}
                  </button>
                ))}
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  )
}

// --- Multi Select ---

function MultiSelect({ soundEnabled }: { soundEnabled?: boolean }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const { trigger } = useHaptics({ debug: soundEnabled })
  const contentRef = useRef<HTMLDivElement | null>(null)

  function toggle(item: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(item)) {
        next.delete(item)
        trigger("light")
      } else {
        next.add(item)
        trigger("selection")
      }
      return next
    })
  }

  const displayValue =
    selected.size === 0
      ? null
      : selected.size <= 2
        ? Array.from(selected).join(", ")
        : `${selected.size} selected`

  return (
    <div className="dsField">
      <label className="dsLabel">Toppings</label>
      <Drawer.Root
        open={open}
        onOpenChange={setOpen}
        snapPoints={[0.6]}
        modal
      >
        <Drawer.Trigger asChild>
          <button type="button" className="dsTrigger">
            <span className={displayValue ? "dsTriggerValue" : "dsTriggerPlaceholder"}>
              {displayValue ?? "Select toppings…"}
            </span>
            <ChevronDown />
          </button>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className="drawerOverlay" />
          <Drawer.Content
            className="drawerContent dsDrawerContent"
            ref={contentRef}
            tabIndex={-1}
            onOpenAutoFocus={(e) => { e.preventDefault(); contentRef.current?.focus() }}
          >
            <Drawer.Handle className="drawerHandle" />
            <div className="drawerBody">
              <div className="dsDrawerHeader">
                <Drawer.Title className="drawerTitle">Pick Toppings</Drawer.Title>
                <button
                  type="button"
                  className="dsDoneButton"
                  onClick={() => {
                    trigger("medium")
                    setOpen(false)
                  }}
                >
                  Done
                </button>
              </div>
              <Drawer.Description className="dsDescription">
                Tap to toggle. Press Done when finished.
              </Drawer.Description>
              <div className="dsOptionList" role="listbox" aria-multiselectable="true">
                {TOPPINGS.map((topping) => {
                  const isSelected = selected.has(topping)
                  return (
                    <button
                      key={topping}
                      type="button"
                      className="dsOption"
                      role="option"
                      aria-selected={isSelected}
                      data-selected={isSelected}
                      onClick={() => toggle(topping)}
                    >
                      <span className="dsCheckbox" data-checked={isSelected}>
                        {isSelected && <CheckIcon />}
                      </span>
                      <span>{topping}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  )
}

// --- Filterable Select ---

function FilterableSelect({ soundEnabled }: { soundEnabled?: boolean }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const { trigger } = useHaptics({ debug: soundEnabled })
  const contentRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const filtered = search
    ? COUNTRIES.filter((c) => c.toLowerCase().includes(search.toLowerCase()))
    : COUNTRIES

  return (
    <div className="dsField">
      <label className="dsLabel">Country</label>
      <Drawer.Root
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setSearch("")
        }}
        snapPoints={[0.65]}
        modal
      >
        <Drawer.Trigger asChild>
          <button type="button" className="dsTrigger">
            <span className={value ? "dsTriggerValue" : "dsTriggerPlaceholder"}>
              {value ?? "Search countries…"}
            </span>
            <ChevronDown />
          </button>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Overlay className="drawerOverlay" />
          <Drawer.Content
            className="drawerContent dsDrawerContent"
            ref={contentRef}
            tabIndex={-1}
            onOpenAutoFocus={(e) => {
              e.preventDefault()
              setTimeout(() => inputRef.current?.focus(), 100)
            }}
          >
            <Drawer.Handle className="drawerHandle" />
            <div className="drawerBody">
              <Drawer.Title className="drawerTitle">Pick a Country</Drawer.Title>
              <Drawer.Description className="dsDescription">
                Type to filter, then tap to select.
              </Drawer.Description>
              <div className="dsSearchWrap">
                <SearchIcon />
                <input
                  ref={inputRef}
                  type="text"
                  className="dsSearchInput"
                  placeholder="Filter…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="dsOptionList dsOptionListScrollable" role="listbox">
                {filtered.length === 0 && (
                  <p className="dsEmpty">No matches</p>
                )}
                {filtered.map((country) => (
                  <button
                    key={country}
                    type="button"
                    className="dsOption"
                    role="option"
                    aria-selected={value === country}
                    data-selected={value === country}
                    onClick={() => {
                      setValue(country)
                      trigger("selection")
                      setOpen(false)
                    }}
                  >
                    <span>{country}</span>
                    {value === country && <CheckIcon />}
                  </button>
                ))}
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  )
}

// --- Slide ---

export function DrawerSelectSlide({ soundEnabled }: DrawerSelectSlideProps) {
  return (
    <div className="stack">
      <p>
        Select controls backed by a bottom drawer — ideal for mobile where
        native <code>&lt;select&gt;</code> pickers are limited. Each variant
        fires haptic feedback on selection.
      </p>
      <SingleSelect soundEnabled={soundEnabled} />
      <MultiSelect soundEnabled={soundEnabled} />
      <FilterableSelect soundEnabled={soundEnabled} />
    </div>
  )
}

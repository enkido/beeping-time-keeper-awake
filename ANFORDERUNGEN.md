# Funktionale Anforderungen: Event-gesteuerte Stoppuhr

## 1. Übergeordnetes Ziel

Das Hauptziel ist die Entwicklung einer modularen Stoppuhr-Anwendung, die auf einem ereignisbasierten (event-driven) Ansatz basiert. Dies soll eine lose Kopplung zwischen den einzelnen Komponenten (z.B. Stoppuhr-Logik, Audio-Benachrichtigungen, UI) ermöglichen und die Wartbarkeit sowie Erweiterbarkeit des Systems verbessern.

## 2. Stoppuhr-Komponente (`useStopwatch` Hook)

Die Stoppuhr-Komponente ist verantwortlich für die Zeitmessung und die Generierung von relevanten Ereignissen.

### 2.1. Event-Generierung

Die Stoppuhr-Komponente muss folgende Ereignisse generieren und über das Event-Framework veröffentlichen:

*   **`stopwatchStarted`**: Wird ausgelöst, wenn die Stoppuhr gestartet oder fortgesetzt wird.
    *   *Daten*: Aktuelle Startzeit (z.B. `{ startTime: number }`).
*   **`stopwatchStopped`**: Wird ausgelöst, wenn die Stoppuhr angehalten wird.
    *   *Daten*: Aktuelle Stoppzeit (z.B. `{ stopTime: number }`).
*   **`stopwatchReset`**: Wird ausgelöst, wenn die Stoppuhr zurückgesetzt wird.
    *   *Daten*: Keine spezifischen Daten erforderlich.
*   **`timeReached`**: Wird ausgelöst, wenn ein vordefiniertes Zeitintervall während der laufenden Zeitmessung erreicht wird.
    *   *Daten*: Aktuelle Zeit, zu der das Intervall erreicht wurde (z.B. `{ currentTime: number }`).

### 2.2. Reaktion auf UI-Events (Indirekte Event-Subscription)

Die Stoppuhr-Logik (innerhalb des Hooks) wird durch direkte Funktionsaufrufe (`handleStart`, `handleStop`, `handleReset`) gesteuert, die typischerweise von UI-Event-Handlern (z.B. Klick auf einen Button) ausgelöst werden. Diese UI-Events sind nicht direkt Teil des hier beschriebenen internen Event-Frameworks der Stoppuhr-Logik, sondern initiieren Aktionen, die zur Generierung der oben genannten internen Events führen.

*   Beispiel: Ein Klick auf den "Start"-Button in der UI ruft `handleStart` auf, was wiederum das `stopwatchStarted`-Event auslöst.

## 3. Audio-System Komponente (`AudioService`)

Das Audio-System ist verantwortlich für die Wiedergabe von akustischen Signalen als Reaktion auf bestimmte Systemereignisse.

### 3.1. Event-Subscription

Das Audio-System muss folgende Ereignisse über das Event-Framework abonnieren:

*   **`timeReached`**: Um einen Signalton abzuspielen, wenn ein Zeitintervall erreicht wurde.
*   **`stopwatchStarted`**: Um optional einen kurzen Ton beim Start der Stoppuhr abzuspielen.
    *   Weitere Events (z.B. `stopwatchStopped`) können optional für akustisches Feedback abonniert werden.

### 3.2. Aktionen

*   Bei Empfang des `timeReached`-Events: Abspielen eines definierten Signaltons (z.B. 880Hz für 300ms).
*   Bei Empfang des `stopwatchStarted`-Events: Abspielen eines definierten, kurzen Signaltons (z.B. 440Hz für 100ms).
*   Das Audio-System muss das Audio-Kontext des Browsers initialisieren, idealerweise nach einer Benutzerinteraktion.

## 4. Event-Framework (`EventEmitter`)

Das Event-Framework bildet die Grundlage für die ereignisgesteuerte Kommunikation.

### 4.1. Kernanforderungen

*   **Publisher/Subscriber-Modell**: Ermöglicht es Komponenten, Events zu veröffentlichen (publish) und andere Komponenten, diese Events zu abonnieren (subscribe).
*   **Lose Kopplung**: Publisher und Subscriber dürfen keine direkten Abhängigkeiten voneinander haben, außer über die Event-Definitionen.
*   **Event-Registrierung und -Deregistrierung**: Komponenten müssen Handler für spezifische Events registrieren und auch wieder deregistrieren können.
*   **Datenübergabe**: Events müssen die Möglichkeit bieten, Daten vom Publisher zum Subscriber zu transportieren.

### 4.2. Logging und Debugging

*   Das Framework muss detaillierte Log-Ausgaben bereitstellen für:
    *   Registrierung von Event-Handlern.
    *   Deregistrierung von Event-Handlern.
    *   Auslösung (Emission) von Events, inklusive der übergebenen Daten.
    *   Fehlerbehandlung innerhalb der Event-Handler.

### 4.3. Zukünftige/Optionale Anforderungen

*   **Asynchrone Eventverarbeitung**: (Aktuell synchron implementiert) Die Möglichkeit, Events asynchron zu verarbeiten, um Blockierungen zu vermeiden, könnte in Zukunft relevant werden.
*   **Priorisierung von Events**: (Optional) Ein Mechanismus zur Priorisierung von Events, falls bestimmte Ereignisse bevorzugt behandelt werden müssen.

## 5. Funktionale Beispiele (Zusammenspiel der Komponenten)

*   **Szenario 1: Intervall erreicht**
    1.  Die `useStopwatch`-Komponente läuft und erreicht ein eingestelltes Zeitintervall.
    2.  `useStopwatch` generiert und veröffentlicht ein `timeReached`-Event mit der aktuellen Zeit.
    3.  Der `AudioService` hat das `timeReached`-Event abonniert, empfängt es und spielt den dafür vorgesehenen Signalton ab.

*   **Szenario 2: Stoppuhr Start**
    1.  Ein Benutzer klickt auf den "Start"-Button in der UI.
    2.  Der UI-Handler ruft die `handleStart`-Funktion der `useStopwatch`-Komponente auf.
    3.  `useStopwatch` setzt ihren internen Zustand auf "laufend" und veröffentlicht ein `stopwatchStarted`-Event mit der Startzeit.
    4.  Der `AudioService` empfängt das `stopwatchStarted`-Event und spielt einen kurzen Bestätigungston ab.

*   **Szenario 3: Stoppuhr Stopp**
    1.  Ein Benutzer klickt auf den "Stopp"-Button in der UI.
    2.  Der UI-Handler ruft die `handleStop`-Funktion der `useStopwatch`-Komponente auf.
    3.  `useStopwatch` setzt ihren internen Zustand auf "gestoppt" und veröffentlicht ein `stopwatchStopped`-Event mit der Stoppzeit.
    4.  (Optional) Der `AudioService` könnte dieses Event abonnieren und einen Ton abspielen.

*   **Szenario 4: Stoppuhr Reset**
    1.  Ein Benutzer klickt auf den "Reset"-Button in der UI.
    2.  Der UI-Handler ruft die `handleReset`-Funktion der `useStopwatch`-Komponente auf.
    3.  `useStopwatch` setzt die Zeit zurück und veröffentlicht ein `stopwatchReset`-Event.
    4.  (Optional) Der `AudioService` könnte dieses Event abonnieren.

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

const db = new sqlite3.Database('phrases.db');

const multer = require('multer');

// Armazenamento com multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });
  const upload = multer({ storage });
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json());
app.use(express.static('public'));

app.use('/uploads', express.static('uploads'));


// Criar tabela com status
db.run(`CREATE TABLE IF NOT EXISTS phrases (
    id INTEGER PRIMARY KEY,
    name TEXT,
    email TEXT,
    phrase TEXT,
    imageUrl TEXT,
    status TEXT DEFAULT 'pendente',
    date TEXT DEFAULT (datetime('now', 'localtime'))
)`);

// Enviar mensagem (salva como pendente)
app.post('/api/phrase', upload.single('photo'), (req, res) => {
    const { name, phrase } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (name && phrase) {
        db.run(
            `INSERT INTO phrases (name, phrase, imageUrl, status) VALUES (?, ?, ?, 'pendente')`,
            [name, phrase, imageUrl],
            function (err) {
                if (err) {
                    console.error("Erro ao salvar a frase:", err);
                    return res.status(500).json({ error: "Erro ao salvar a frase." });
                }

                const responseData = { 
                    id: this.lastID,
                    name,
                    phrase,
                    imageUrl
                };

                // Envia para admin via WebSocket
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            signal: 'nova_pendente',
                            data: responseData
                        }));
                    }
                });

                console.log('Mensagem pendente salva:', responseData);
                res.status(200).json(responseData);
            }
        );
    } else {
        console.log('Dados inválidos recebidos');
        res.status(400).json({ error: "Dados inválidos." });
    }
});


// Buscar pendentes
app.get('/api/messages/pendentes', (req, res) => {
    db.all(`SELECT * FROM phrases WHERE status = 'pendente' ORDER BY id DESC`, [], (err, rows) => {
        if (err) return res.status(500).send("Erro ao buscar pendentes.");
        res.json(rows);
    });
});

// Buscar aprovadas
app.get('/api/messages/aprovadas', (req, res) => {
    db.all(`SELECT * FROM phrases WHERE status = 'aprovada' ORDER BY id DESC`, [], (err, rows) => {
        if (err) return res.status(500).send("Erro ao buscar aprovadas.");
        res.json(rows);
    });
});

// Aprovar mensagem
app.post('/api/message/:id/aprovar', (req, res) => {
    const id = req.params.id;
    db.run(`UPDATE phrases SET status = 'aprovada' WHERE id = ?`, [id], function (err) {
        if (err) return res.status(500).json({ error: 'Erro ao aprovar.' });

        db.get(`SELECT * FROM phrases WHERE id = ?`, [id], (err, row) => {
            if (row) {
                const responseData = {
                    id: row.id,
                    name: row.name,
                    phrase: row.phrase,
                    imageUrl: 'http://localhost:3000' + row.imageUrl,
                    date: row.date
                };

                // Envia para Unity
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(responseData));
                    }
                });

                res.json({ success: true });
            }
        });
    });
});

// Rejeitar
app.post('/api/message/:id/rejeitar', (req, res) => {
    const id = req.params.id;
    db.run(`DELETE FROM phrases WHERE id = ?`, [id], function (err) {
        if (err) return res.status(500).json({ error: 'Erro ao rejeitar.' });
        res.json({ success: true });
    });
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
    app.use(express.static(path.join(__dirname, 'public')));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
    app.use(express.static(path.join(__dirname, 'public')));
});

// WebSocket
wss.on('connection', ws => {
    console.log('Cliente conectado');
});

// Iniciar servidor
server.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});




import React, { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios"; import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Chart,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './App.css';

function App() {
  const [validated, setValidated] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [paisSelecionado, setPaisSelecionado] = useState();
  const [reportPaisSelecionado, setReportPaisSelecionado] = useState();
  const [paises, setPaises] = useState([]);

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );
  Chart.defaults.font.size = 20;
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Status Covid ' + paisSelecionado,
      },
    },
  };
  const labels = ['confirmed', 'deaths', 'recovered', 'active'];
  const data = {
    labels,
    datasets: [
      {
        label: 'Dataset 1',
        data: reportPaisSelecionado,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  useEffect(() => {
    axios({
      method: 'get',
      url: process.env.URL + '/regions',
    }).then((response) => {
      setPaises(response.data);
    }).catch((error) => {
      toast.error(error.response);
      setPaises([]);
    });
  }, []);

  const handleSubmit = (event) => {
    setSubmitted(true);
    const form = event.currentTarget;
    const formData = new FormData(event.target),

      formDataObj = Object.fromEntries(formData.entries())
    event.preventDefault();
    event.stopPropagation();

    if (!formDataObj.pais) {
      setSubmitted(false);
      toast.error("O País deve estar selecionado para fazer a busca.")
    } else {
      if (form.checkValidity() === false) {
        setSubmitted(false);
        setValidated(true);
      } else {
        setValidated(true);


        var paisSplit = paisSelecionado.split('-');
        var name = paisSplit[0];
        var iso = paisSplit[1];

        axios({
          method: 'get',
          url: process.env.URL + '/report?region_name=' + name + '&iso=' + iso
        }).then(response => {
          setReportPaisSelecionado(response.data);
          setSubmitted(false);
        }).catch(error => {
          setReportPaisSelecionado();
          setSubmitted(false);
          toast.error(error.response);
        });
      }
    };
  }

  return (
    <div className="App">
      <header className="App-header">
        <div id="alignTextLeft">
          <h3 className="font">Selecione um país para ver os índices do covid 19</h3>
        </div>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Form.Group controlId="form.pais">
            <Form.Select name="pais" onChange={e => {
              setPaisSelecionado(e.target.value);
              setReportPaisSelecionado();
            }} required>
              <option value=''>Selecione o país</option>
              {paises.map(
                (pais, i) => (
                  <option value={pais.name + '-' + pais.iso}>{pais.name}</option>
                )
              )}
            </Form.Select><br />
          </Form.Group>
          <Button id="button" type="submit" size="lg" disabled={submitted}>Buscar dados</Button><br /><br />
        </Form>
        <Toaster />
      </header>
      {reportPaisSelecionado &&
        <div class="row">
          <div className="col-md-4 offset-md-4">
            <Bar options={options} data={data} width={5} height={5} />
          </div>
        </div>
      }
    </div>
  );
}

export default App;
